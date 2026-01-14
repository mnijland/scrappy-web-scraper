import './globals.css';
import Sidebar from '@/components/Sidebar';
import { Search, Bell, HelpCircle } from 'lucide-react';

export const metadata = {
    title: 'Scrappy | Web to Data',
    description: 'AI-Powered Web Scraper',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)' }}>

                    {/* Semantic Sidebar */}
                    <Sidebar />

                    {/* Main Content Area */}
                    {/* Added margin-left equal to sidebar width (260px) to prevent overlap */}
                    <main style={{
                        flex: 1,
                        padding: '2.5rem',
                        marginLeft: 'var(--sidebar-width)',
                        width: 'calc(100% - var(--sidebar-width))'
                    }}>
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}
