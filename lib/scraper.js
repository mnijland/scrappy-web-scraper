import * as cheerio from 'cheerio';

export async function scrapeUrl(url) {
    const startTime = Date.now();
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            }
        });

        if (!response.ok) {
            // Return error object in array format to keep signature consistent
            return [{
                url,
                title: 'Failed to access URL',
                description: `Status: ${response.status}`,
                error: true
            }];
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        let items = [];

        // Helper to extract meta
        const getMeta = (props) => {
            for (const p of props) {
                const val = $(`meta[property="${p}"]`).attr('content') || $(`meta[name="${p}"]`).attr('content');
                if (val) return val;
            }
            return '';
        }

        // 1. Try JSON-LD Loop
        $('script[type="application/ld+json"]').each((_, el) => {
            try {
                const json = JSON.parse($(el).html());
                // Flatten graph or array
                const objects = Array.isArray(json) ? json : (json['@graph'] || [json]);

                objects.forEach(obj => {
                    if (obj['@type'] === 'Product') {
                        const item = {
                            url: obj.url || url,
                            title: obj.name || '',
                            description: obj.description || '',
                            image: '',
                            price: '',
                            currency: '',
                            brand: ''
                        };

                        if (obj.image) {
                            item.image = Array.isArray(obj.image) ? obj.image[0] : (typeof obj.image === 'object' ? obj.image.url : obj.image);
                        }
                        if (obj.brand) {
                            item.brand = typeof obj.brand === 'object' ? obj.brand.name : obj.brand;
                        }
                        if (obj.offers) {
                            const offer = Array.isArray(obj.offers) ? obj.offers[0] : obj.offers;
                            if (offer) {
                                item.price = offer.price;
                                item.currency = offer.priceCurrency;
                                // Sometimes URL is in the offer
                                if (offer.url && !item.url) item.url = offer.url;
                            }
                        }

                        // Only add if it has at least a title
                        if (item.title) items.push(item);
                    }
                });

                // Also check for ItemList (Category Pages)
                const itemList = objects.find(o => o['@type'] === 'ItemList');
                if (itemList && itemList.itemListElement) {
                    itemList.itemListElement.forEach(el => {
                        const product = el.item || el; // sometimes it's nested
                        if (product) {
                            items.push({
                                url: product.url || url,
                                title: product.name || '',
                                description: product.description || '',
                                image: product.image || '',
                                price: product.offers ? (product.offers.price || '') : '',
                                currency: product.offers ? (product.offers.priceCurrency || '') : '',
                                brand: ''
                            });
                        }
                    });
                }
            } catch (e) { }
        });

        // 2. CSS Fallback (Grid detection)
        // If we found very few items (e.g. just 1 from JSON-LD which might be just a main product or breadcrumb), 
        // we should still look for visual product cards to see if it's a list page.
        if (items.length < 3) {
            // Expanded selectors including generic classes often used for grids
            const cardSelectors = [
                '.product-card', '.product-item', '.grid-view-item', 'li.product', '.card', '.item',
                '[data-product-id]', '.product', '.products-grid > div', '.product-list > div',
                '.shop-item', 'article', '.product-tile', '.product-wrapper', '.v-card'
            ];

            // Strategy: Find any selector that repeats significantly (>2 times) and contains an image and a link
            for (const selector of cardSelectors) {
                const elements = $(selector);
                if (elements.length > 2) {
                    const candidates = [];

                    elements.each((_, el) => {
                        const $el = $(el);
                        // Heuristics: Must have a link and an image to be considered a product card candidate
                        const linkEl = $el.find('a').first();
                        const imgEl = $el.find('img').first();

                        if (linkEl.length && imgEl.length) {
                            // IMPROVED TITLE DETECTION
                            // 1. Try specific title classes first (Magento/Hyvä uses .product-item-link)
                            let title = $el.find('.product-item-link, .product-name, .product-title, .name, h2, h3, h4, h5, [class*="title"], [class*="name"]').first().text().trim();

                            // 2. If no explicit title element, check the links.
                            if (!title) {
                                // If the first link has text, use it.
                                if (linkEl.text().trim().length > 0) {
                                    title = linkEl.text().trim();
                                } else {
                                    // If first link is empty (image link), try the second link?
                                    const secondLink = $el.find('a').eq(1);
                                    if (secondLink.length && secondLink.text().trim().length > 0) {
                                        title = secondLink.text().trim();
                                    }
                                }
                            }

                            // Clean title (remove newlines/tabs)
                            title = title ? title.replace(/\s+/g, ' ').trim() : '';

                            const link = linkEl.attr('href');
                            const img = imgEl.attr('src') || imgEl.attr('data-src') || imgEl.attr('data-lazy-src'); // Handle lazy load + common variations
                            const priceText = $el.find('.price, .amount, .money, [class*="price"]').text().trim();
                            const priceMatch = priceText ? priceText.match(/[\d.,]+/) : null;

                            // Final validation: Title must be present and result in longer than 2 chars
                            if (title && link && title.length > 2) {
                                // Attempt to find stock status
                                let stock = '';
                                const stockEl = $el.find('.stock, .availability, .inventory, .in-stock, .out-of-stock, [class*="stock"], [class*="availability"]').first();
                                if (stockEl.length) {
                                    stock = stockEl.text().trim();
                                }

                                candidates.push({
                                    url: link.startsWith('http') ? link : new URL(link, url).toString(),
                                    title: title,
                                    description: '',
                                    image: img ? (img.startsWith('http') ? img : new URL(img, url).toString()) : '',
                                    price: priceMatch ? priceMatch[0] : '',
                                    currency: '',
                                    brand: '',
                                    stock: stock
                                });
                            }
                        }
                    });

                    if (candidates.length > 0) {
                        // If we found significantly more items via CSS than JSON-LD, use CSS (or merge)
                        // Simple merge: key them by URL
                        items.push(...candidates);
                        break; // Use the first valid grid we found
                    }
                }
            }

            // Special Case: Altrex Spare Parts List (Table-like structure)
            // Pattern: <a href="..." class="product item"> <div class="col name">...</div> </a>
            if (items.length < 3) {
                const partRows = $('a.product.item');
                if (partRows.length > 1) {
                    partRows.each((_, el) => {
                        const $el = $(el);
                        const title = $el.find('.col.name').text().trim();
                        const link = $el.attr('href');
                        const img = $el.find('.col.image img').attr('src');
                        const priceText = $el.find('.col.price').text().trim();
                        const priceMatch = priceText ? priceText.match(/[\d.,]+/) : null;
                        const sku = $el.find('.col.sku').clone().children().remove().end().text().trim(); // Remove label span

                        // Altrex Stock Logic
                        let stock = '';
                        if ($el.find('.stock-status-wrapper .in-stock').length) {
                            stock = 'In Stock';
                        } else if ($el.find('.stock-status-wrapper .out-of-stock').length) {
                            stock = 'Out of Stock';
                        } else {
                            stock = $el.find('.col.stock').text().trim().replace('Voorraad', '').trim();
                        }

                        if (title && link) {
                            items.push({
                                url: link.startsWith('http') ? link : new URL(link, url).toString(),
                                title: title,
                                description: sku ? `SKU: ${sku}` : '',
                                image: img ? (img.startsWith('http') ? img : new URL(img, url).toString()) : '',
                                price: priceMatch ? priceMatch[0] : '',
                                currency: 'EUR', // Altrex is EUR specific
                                brand: 'Altrex',
                                sku: sku,
                                stock: stock
                            });
                        }
                    });
                }
            }
        }

        // 3. Fallback: Parse main page meta as single product if still empty
        if (items.length === 0) {
            const ogTitle = $('meta[property="og:title"]').attr('content');
            const ogUrl = $('meta[property="og:url"]').attr('content');
            const ogImage = $('meta[property="og:image"]').attr('content');
            const ogPrice = $('meta[property="product:price:amount"]').attr('content');

            if (ogTitle && ogUrl) {
                items.push({
                    url: ogUrl,
                    title: ogTitle,
                    description: $('meta[property="og:description"]').attr('content') || '',
                    image: ogImage || '',
                    price: ogPrice || '',
                    currency: $('meta[property="product:price:currency"]').attr('content') || '',
                    stock: ''
                });
            }
        }

        // De-duplicate items by URL or Title
        const uniqueItems = [];
        const seen = new Set();
        for (const item of items) {
            const key = item.url + item.title;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueItems.push(item);
            }
        }

        // Deep Scraping: If result count is small (< 50) and deep scrape enabled (conceptually)
        // We will fetch PDPs for extra data.

        // LIMIT concurrency to avoid timeouts/blocks
        const MAX_CONCURRENT = 5;
        const itemsToEnrich = uniqueItems.slice(0, 50); // limit to 50 for performance

        let enrichedItems = [];
        for (let i = 0; i < itemsToEnrich.length; i += MAX_CONCURRENT) {
            const chunk = itemsToEnrich.slice(i, i + MAX_CONCURRENT);
            const promises = chunk.map(item => scrapePDP(item));
            const results = await Promise.all(promises);
            enrichedItems.push(...results);
        }

        // Add remaining items if any (without enrichment)
        if (uniqueItems.length > 50) {
            enrichedItems.push(...uniqueItems.slice(50));
        }

        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2); // Seconds

        // Attach metadata to the array
        enrichedItems.duration = duration;

        return enrichedItems;

    } catch (error) {
        console.error('Scraper Error:', error);
        return [];
    }
}


async function scrapePDP(item) {
    if (!item.url) return item;
    try {
        const response = await fetch(item.url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });
        const html = await response.text();
        const $ = cheerio.load(html);

        // Extract Schema.org Product data
        let schemaData = {};
        $('script[type="application/ld+json"]').each((_, el) => {
            try {
                const json = JSON.parse($(el).html());
                if (json['@type'] === 'Product') {
                    schemaData = json;
                } else if (Array.isArray(json)) {
                    const product = json.find(i => i['@type'] === 'Product');
                    if (product) schemaData = product;
                }
            } catch (e) { }
        });

        // 1. Rating
        let rating = '';
        let reviewCount = '';

        if (schemaData.aggregateRating) {
            rating = schemaData.aggregateRating.ratingValue;
            reviewCount = schemaData.aggregateRating.reviewCount;
        } else {
            // Fallback: Meta tags or common classes
            const ratingEl = $('.rating-result, .rating-summary, [itemprop="ratingValue"]');
            if (ratingEl.length) {
                rating = ratingEl.attr('content') || ratingEl.attr('title') || ratingEl.text().trim();
            }
        }

        // 2. Short Description & Long Description
        let shortDesc = schemaData.description || $('meta[name="description"]').attr('content') || '';
        let longDesc = '';

        // Try to find description in body
        const shortDescEl = $('.product-info-main .description, .short-description, .product-short-description');
        if (shortDescEl.length && !shortDesc) {
            shortDesc = shortDescEl.first().text().trim();
        }

        const longDescEl = $('.product.attribute.description, #description, .description, .product-long-description').not(shortDescEl);
        if (longDescEl.length) {
            longDesc = longDescEl.first().text().trim();
        }

        // 3. EAN / SKU
        let sku = schemaData.sku || item.sku || ''; // Use existing SKU if we found it on listing
        if (!sku) {
            sku = $('[itemprop="sku"]').text().trim() || $('.sku, .product-sku').text().replace('SKU:', '').trim();
        }

        const ean = schemaData.gtin13 || schemaData.gtin || $('[itemprop="gtin13"], [itemprop="gtin"]').attr('content') || '';

        // 4. Stock (Deep Scrape)
        let stock = item.stock || '';
        if (!stock) {
            if (schemaData.offers && schemaData.offers.availability) {
                const avail = schemaData.offers.availability;
                if (avail.includes('InStock')) stock = 'In Stock';
                else if (avail.includes('OutOfStock')) stock = 'Out of Stock';
                else if (avail.includes('PreOrder')) stock = 'Pre-Order';
            } else {
                const stockEl = $('.stock, .availability, [class*="stock"]').first();
                if (stockEl.length) stock = stockEl.text().trim();
            }
        }

        // Format Rating
        if (rating) {
            rating = rating.toString().replace(/\s+/g, '').trim();
        }

        return {
            ...item,
            rating: rating || item.rating,
            reviewCount: reviewCount || item.reviewCount,
            shortDescription: shortDesc || item.shortDescription,
            longDescription: longDesc || item.longDescription,
            sku: sku || item.sku,
            ean: ean || item.ean,
            stock: stock || item.stock
        };

    } catch (e) {
        console.log('Error enriching item', item.url, e.message);
        return item;
    }
}
