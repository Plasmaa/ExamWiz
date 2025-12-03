import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { BookOpen, Loader2, X } from 'lucide-react';

export default function SignupModal({ isOpen, onClose, onSwitchToLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.post('/users/', { email, password });
            // Auto login after signup
            const formData = new FormData();
            formData.append('username', email);
            formData.append('password', password);
            const response = await api.post('/token', formData);
            localStorage.setItem('token', response.data.access_token);
            navigate('/dashboard');
        } catch (err) {
            setError('Error creating account. Email might be taken.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="relative w-full max-w-md p-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-4 z-10"
                    onClick={onClose}
                >
                    <X className="h-4 w-4" />
                </Button>

                <Card className="border-none shadow-lg">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center justify-center mb-4">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <BookOpen className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl text-center">Create an account</CardTitle>
                        <CardDescription className="text-center">
                            Enter your details to get started with ExamWiz
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSignup} className="space-y-4" autoComplete="off">
                            <div className="space-y-2">
                                <Label htmlFor="signup-email">Email</Label>
                                <Input
                                    id="signup-email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="off"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="signup-password">Password</Label>
                                <Input
                                    id="signup-password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="new-password"
                                />
                                <p className="text-xs text-muted-foreground">Must be at least 8 characters long</p>
                            </div>
                            {error && <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md">{error}</div>}
                            <Button className="w-full" type="submit" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {loading ? "Creating account..." : "Create account"}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center border-t p-6">
                        <p className="text-sm text-muted-foreground">
                            Already have an account? {onSwitchToLogin ? (
                                <button onClick={onSwitchToLogin} className="text-primary hover:underline font-medium bg-transparent border-none p-0 cursor-pointer">Login</button>
                            ) : (
                                <Link to="/login" className="text-primary hover:underline font-medium">Login</Link>
                            )}
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
