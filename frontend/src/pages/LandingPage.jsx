import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { BookOpen, CheckCircle, Upload, FileText, Zap } from 'lucide-react';
import LoginModal from '../components/LoginModal';
import SignupModal from '../components/SignupModal';

export default function LandingPage({ defaultOpenLogin = false, defaultOpenSignup = false }) {
    const [isLoginOpen, setIsLoginOpen] = useState(defaultOpenLogin);
    const [isSignupOpen, setIsSignupOpen] = useState(defaultOpenSignup);
    const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('token'));

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, [location]);

    useEffect(() => {
        if (defaultOpenLogin) {
            setIsLoginOpen(true);
            setIsSignupOpen(false);
        } else if (defaultOpenSignup) {
            setIsSignupOpen(true);
            setIsLoginOpen(false);
        } else {
            setIsLoginOpen(false);
            setIsSignupOpen(false);
        }
    }, [defaultOpenLogin, defaultOpenSignup, location.pathname]);

    const openLogin = () => {
        navigate('/login');
    };

    const openSignup = () => {
        navigate('/signup');
    };

    const closeLogin = () => {
        setIsLoginOpen(false);
        if (location.pathname === '/login') {
            navigate('/');
        }
    };

    const closeSignup = () => {
        setIsSignupOpen(false);
        if (location.pathname === '/signup') {
            navigate('/');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <LoginModal isOpen={isLoginOpen} onClose={closeLogin} onSwitchToSignup={openSignup} />
            <SignupModal isOpen={isSignupOpen} onClose={closeSignup} onSwitchToLogin={openLogin} />

            {/* Navbar */}
            <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8 mx-auto">
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-80 transition-opacity">
                        <BookOpen className="h-6 w-6" />
                        <span>ExamWiz</span>
                    </Link>
                    <nav className="flex items-center gap-4">
                        {isLoggedIn ? (
                            <>
                                <Link to="/dashboard">
                                    <Button variant="ghost">Dashboard</Button>
                                </Link>
                                <Button onClick={handleLogout} variant="outline">Logout</Button>
                            </>
                        ) : (
                            <>
                                <Button variant="ghost" onClick={openLogin}>Login</Button>
                                <Button onClick={openSignup}>Get Started</Button>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1">
                <section className="container px-4 md:px-8 mx-auto py-24 md:py-32 flex flex-col items-center text-center space-y-8">
                    <div className="space-y-4 max-w-3xl">
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                            Turn your study material into <span className="text-primary">exams instantly</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-[42rem] mx-auto">
                            Upload your notes, textbooks, or articles and let AI generate practice questions, quizzes, and exams in seconds.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 min-w-[200px]">
                        {isLoggedIn ? (
                            <Button size="lg" className="w-full sm:w-auto px-8 text-lg h-12" onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
                        ) : (
                            <>
                                <Button size="lg" className="w-full sm:w-auto px-8 text-lg h-12" onClick={openSignup}>Start Generating Free</Button>
                                <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 text-lg h-12" onClick={openLogin}>Log In</Button>
                            </>
                        )}
                    </div>

                    {/* Feature Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full max-w-5xl text-left">
                        <div className="p-6 rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow">
                            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-primary mb-4">
                                <Upload className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Upload Anything</h3>
                            <p className="text-muted-foreground">Support for PDF, TXT, and images. Just drag and drop your study materials.</p>
                        </div>
                        <div className="p-6 rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow">
                            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-primary mb-4">
                                <Zap className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Instant Generation</h3>
                            <p className="text-muted-foreground">Advanced AI analyzes your content and creates relevant questions in seconds.</p>
                        </div>
                        <div className="p-6 rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow">
                            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-primary mb-4">
                                <FileText className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Export & Print</h3>
                            <p className="text-muted-foreground">Download your exams as PDF, DOCX, or TXT files to study offline.</p>
                        </div>
                    </div>
                </section>

                {/* Social Proof / Trust */}
                <section className="border-t bg-muted/50 py-24">
                    <div className="container px-4 md:px-8 mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-12">Trusted by students and teachers</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            <div className="space-y-4">
                                <div className="flex justify-center text-yellow-500">
                                    {[...Array(5)].map((_, i) => <CheckCircle key={i} className="h-5 w-5 fill-current" />)}
                                </div>
                                <p className="text-lg italic">"Saved me hours of prep time for my finals. The questions are surprisingly accurate."</p>
                                <p className="font-semibold">- Sarah J., Med Student</p>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-center text-yellow-500">
                                    {[...Array(5)].map((_, i) => <CheckCircle key={i} className="h-5 w-5 fill-current" />)}
                                </div>
                                <p className="text-lg italic">"I use this to create quick quizzes for my students based on the reading material."</p>
                                <p className="font-semibold">- Prof. Michael R.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-center text-yellow-500">
                                    {[...Array(5)].map((_, i) => <CheckCircle key={i} className="h-5 w-5 fill-current" />)}
                                </div>
                                <p className="text-lg italic">"The best way to test yourself before the actual exam. Highly recommend!"</p>
                                <p className="font-semibold">- Alex T., Engineering</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t py-12 bg-background">
                <div className="container px-4 md:px-8 mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 font-bold text-lg text-primary">
                        <BookOpen className="h-5 w-5" />
                        <span>ExamWiz</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        © 2024 ExamWiz. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-muted-foreground">
                        <Link to="#" className="hover:text-foreground">Privacy</Link>
                        <Link to="#" className="hover:text-foreground">Terms</Link>
                        <Link to="#" className="hover:text-foreground">Contact</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
