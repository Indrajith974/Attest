import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

export default function LandingPage() {
    const { isAuthenticated } = useAuth();
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen overflow-hidden">
            {/* Floating Header */}
            <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
                style={{
                    backgroundColor: scrollY > 50 ? 'var(--color-surface)' : 'transparent',
                    borderBottom: scrollY > 50 ? '1px solid var(--color-border)' : 'none',
                    backdropFilter: scrollY > 50 ? 'blur(12px)' : 'none'
                }}>
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                            Attest
                        </span>
                    </div>
                    <nav className="flex items-center gap-6">
                        <a href="#features" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hidden sm:block">Features</a>
                        <a href="#how-it-works" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hidden sm:block">How It Works</a>
                        {isAuthenticated ? (
                            <Link to="/dashboard" className="btn-primary text-sm py-2 px-4">Dashboard</Link>
                        ) : (
                            <Link to="/login" className="btn-primary text-sm py-2 px-4">Get Started</Link>
                        )}
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center pt-20">
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
                </div>

                {/* Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%234F46E5\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

                <div className="relative max-w-6xl mx-auto px-4 py-20 text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 mb-8 animate-fade-in">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Trusted by individuals worldwide</span>
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-5xl sm:text-7xl font-bold mb-6 leading-tight">
                        <span className="block text-[var(--color-text)]">Your Life Events,</span>
                        <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
                            Verified Forever
                        </span>
                    </h1>

                    <p className="text-xl sm:text-2xl text-[var(--color-text-secondary)] mb-4 max-w-2xl mx-auto">
                        Create <strong className="text-[var(--color-text)]">tamper-proof</strong> claims backed by <strong className="text-[var(--color-text)]">human witnesses</strong>.
                    </p>

                    <p className="text-lg text-[var(--color-text-secondary)] mb-12 max-w-xl mx-auto opacity-80">
                        Build a permanent, immutable record that can never be altered or deleted.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                        <Link
                            to="/login"
                            className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-semibold px-8 py-4 rounded-xl shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:-translate-y-1"
                        >
                            Start Free Today
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                        <a
                            href="#how-it-works"
                            className="inline-flex items-center justify-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] text-lg font-semibold px-8 py-4 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Watch How It Works
                        </a>
                    </div>

                    {/* Demo Card Preview */}
                    <div className="relative max-w-lg mx-auto">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl blur-xl opacity-20" />
                        <div className="relative bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 shadow-2xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold">Employment at TechCorp Inc.</div>
                                    <div className="text-sm text-[var(--color-text-secondary)]">Verified by 3 witnesses</div>
                                </div>
                                <div className="ml-auto text-right">
                                    <div className="text-2xl font-bold text-green-600">95%</div>
                                    <div className="text-xs text-[var(--color-text-secondary)]">Confidence</div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <span className="badge-employment text-xs">Employment</span>
                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs">3 Confirmations</span>
                                <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs">2 Evidence</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <svg className="w-6 h-6 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-[var(--color-surface)] scroll-mt-20">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wider">Features</span>
                        <h2 className="text-4xl sm:text-5xl font-bold mt-2 mb-4">
                            Why Choose Attest?
                        </h2>
                        <p className="text-xl text-[var(--color-text-secondary)] max-w-xl mx-auto">
                            Built from the ground up for trust, transparency, and permanence.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: '🔒',
                                gradient: 'from-indigo-500 to-purple-500',
                                title: 'Immutable by Design',
                                desc: 'Once created, claims and responses cannot be edited or deleted. Your proof stands forever.'
                            },
                            {
                                icon: '👥',
                                gradient: 'from-purple-500 to-pink-500',
                                title: 'Human Verification',
                                desc: 'Real people verify your claims. Not bots. Not AI. Real human witnesses you choose.'
                            },
                            {
                                icon: '📊',
                                gradient: 'from-cyan-500 to-teal-500',
                                title: 'Transparent Scoring',
                                desc: 'See exactly how your confidence score is calculated. Full breakdown, no black box.'
                            },
                            {
                                icon: '📄',
                                gradient: 'from-orange-500 to-red-500',
                                title: 'Shareable Proof',
                                desc: 'Download PDFs, share QR codes, or send public links. Your proof, accessible anywhere.'
                            },
                            {
                                icon: '🔍',
                                gradient: 'from-green-500 to-emerald-500',
                                title: 'Full Audit Trail',
                                desc: 'Every action is logged with timestamps. Complete transparency and accountability.'
                            },
                            {
                                icon: '🌐',
                                gradient: 'from-blue-500 to-indigo-500',
                                title: 'Works Globally',
                                desc: 'No borders, no restrictions. Create and verify claims from anywhere in the world.'
                            },
                        ].map((feature, i) => (
                            <div key={i} className="group p-6 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-indigo-300 dark:hover:border-indigo-700 transition-all hover:-translate-y-2">
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-[var(--color-text-secondary)]">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-24 scroll-mt-20">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wider">How It Works</span>
                        <h2 className="text-4xl sm:text-5xl font-bold mt-2 mb-4">
                            Three Simple Steps
                        </h2>
                        <p className="text-xl text-[var(--color-text-secondary)] max-w-xl mx-auto">
                            Get your first verified proof in under 5 minutes.
                        </p>
                    </div>

                    <div className="relative">
                        {/* Connection Line */}
                        <div className="hidden md:block absolute top-24 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-full" />

                        <div className="grid md:grid-cols-3 gap-12">
                            {[
                                {
                                    step: 1,
                                    color: 'indigo',
                                    title: 'Create Your Claim',
                                    desc: 'Document any life event with details and supporting evidence. Choose from 20+ templates or start custom.',
                                    icon: (
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    )
                                },
                                {
                                    step: 2,
                                    color: 'purple',
                                    title: 'Invite Witnesses',
                                    desc: 'Share unique links with people who can verify your claim. They respond anonymously with just a click.',
                                    icon: (
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    )
                                },
                                {
                                    step: 3,
                                    color: 'cyan',
                                    title: 'Get Verified Proof',
                                    desc: 'Receive your confidence score instantly. Download PDF, share QR code, or send the public proof link.',
                                    icon: (
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    )
                                }
                            ].map((item) => (
                                <div key={item.step} className="relative text-center">
                                    <div className={`w-16 h-16 mx-auto bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-${item.color}-500/30 mb-6 relative z-10`}>
                                        {item.icon}
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-[var(--color-bg)] border-2 border-[var(--color-border)] rounded-full flex items-center justify-center font-bold text-sm z-20">
                                        {item.step}
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                                    <p className="text-[var(--color-text-secondary)]">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Use Cases */}
            <section className="py-24 bg-[var(--color-surface)]">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wider">Use Cases</span>
                        <h2 className="text-4xl sm:text-5xl font-bold mt-2 mb-4">
                            What Can You Prove?
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { icon: '🏠', title: 'Residence', color: 'indigo' },
                            { icon: '💼', title: 'Employment', color: 'purple' },
                            { icon: '🎓', title: 'Education', color: 'pink' },
                            { icon: '👨‍👩‍👧', title: 'Family', color: 'orange' },
                            { icon: '🏥', title: 'Medical', color: 'red' },
                            { icon: '🚗', title: 'Assets', color: 'green' },
                            { icon: '💰', title: 'Financial', color: 'cyan' },
                            { icon: '✈️', title: 'Travel', color: 'blue' },
                        ].map((item, i) => (
                            <div key={i} className="group p-6 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-indigo-300 dark:hover:border-indigo-700 transition-all hover:-translate-y-1 text-center">
                                <span className="text-4xl block mb-2 group-hover:scale-125 transition-transform">{item.icon}</span>
                                <h3 className="font-semibold">{item.title}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-500" />
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

                <div className="relative max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                        Ready to Build Your Verified History?
                    </h2>
                    <p className="text-xl text-white/80 mb-10 max-w-xl mx-auto">
                        Join thousands who trust Attest for their permanent proof needs. Start free today.
                    </p>
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 bg-white text-indigo-600 font-semibold text-lg px-10 py-4 rounded-xl hover:bg-gray-100 transition-all shadow-2xl hover:-translate-y-1"
                    >
                        Get Started Free
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                                </svg>
                            </div>
                            <span className="font-bold">Attest</span>
                            <span className="text-[var(--color-text-secondary)]">• Immutable Human-Verified Proofs</span>
                        </div>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                            © 2026 Attest. All claims are permanent and immutable.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
