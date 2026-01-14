# Scrappy - Web Scraper Tool

<div align="center">

![Scrappy Logo](https://img.shields.io/badge/Scrappy-Web%20Scraper-blue?style=for-the-badge)

A powerful, production-ready web scraping tool built with Next.js. Extract product data from any e-commerce website, edit it visually, and export to CSV.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Vercel Postgres](https://img.shields.io/badge/Database-Vercel%20Postgres-blue?style=flat-square)](https://vercel.com/storage/postgres)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## ✨ Features

- 🔍 **Smart Scraping** - Automatically detects product lists using JSON-LD and CSS selectors
- 🎯 **Deep Scraping** - Enriches data by visiting individual product pages
- 📊 **Visual Editor** - Edit scraped data in a beautiful, spreadsheet-like interface
- 💾 **Session Management** - Save and organize scraping sessions
- 📁 **CSV Export** - Export data with custom column names
- 🗄️ **Database Ready** - Supports Vercel Postgres for production deployments
- 🎨 **Dark Theme** - Beautiful, modern UI with dark mode
- 📱 **Responsive** - Works on desktop and mobile

---

## 🚀 Quick Start

### Local Development

```bash
# Clone the repository
git clone https://github.com/mnijland/scrappy-web-scraper.git
cd scrappy-web-scraper

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 What Gets Scraped

Scrappy extracts comprehensive product data:

- **Basic Info**: Title, Price, Brand, Image, URL
- **Stock Status**: Availability/inventory information
- **Descriptions**: Short and long product descriptions
- **Ratings**: Star ratings and review counts
- **Identifiers**: SKU, EAN/GTIN codes

---

## 🗄️ Database Setup (Optional)

For production deployments, Scrappy supports Vercel Postgres:

```bash
# Copy environment template
cp .env.local.example .env.local

# Add your database credentials to .env.local
# Then initialize the database:
npm run dev
# Visit: http://localhost:3000/api/init-db
```

**Without a database**, Scrappy automatically uses local JSON file storage.

See [DATABASE_SETUP.md](docs/DATABASE_SETUP.md) for detailed instructions.

---

## 🌐 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mnijland/scrappy-web-scraper)

1. Click the button above
2. Create a Postgres database in Vercel dashboard
3. Deploy!

Environment variables are automatically configured by Vercel.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Styling**: Vanilla CSS with CSS Variables
- **Scraping**: [Cheerio](https://cheerio.js.org/) for HTML parsing
- **Database**: [Vercel Postgres](https://vercel.com/storage/postgres) (optional)
- **Icons**: [Lucide React](https://lucide.dev/)
- **CSV Export**: [PapaParse](https://www.papaparse.com/)

---

## 📖 Documentation

- [Database Setup Guide](docs/DATABASE_SETUP.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [API Documentation](docs/API.md)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

Built with ❤️ using Next.js and Vercel

---

<div align="center">

**[Report Bug](https://github.com/mnijland/scrappy-web-scraper/issues)** • **[Request Feature](https://github.com/mnijland/scrappy-web-scraper/issues)**

</div>
