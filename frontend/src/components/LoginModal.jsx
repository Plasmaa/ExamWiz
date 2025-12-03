import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { BookOpen, Loader2, X } from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onSwitchToSignup }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('username', email);
            formData.append('password', password);

            const response = await api.post('/token', formData);
            localStorage.setItem('token', response.data.access_token);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid email or password');
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
                        <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
                        <CardDescription className="text-center">
                            Enter your credentials to access your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="modal-email">Email</Label>
                                <Input
                                    id="modal-email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="modal-password">Password</Label>
                                <Input
                                    id="modal-password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <div className="flex justify-end">
                                    <Link to="#" className="text-sm text-primary hover:underline">Forgot password?</Link>
                                </div>
                            </div>
                            {error && <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md">{error}</div>}
                            <Button className="w-full" type="submit" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {loading ? "Signing in..." : "Sign in"}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center border-t p-6">
                        <p className="text-sm text-muted-foreground">
                            Don't have an account? {onSwitchToSignup ? (
                                <button onClick={onSwitchToSignup} className="text-primary hover:underline font-medium bg-transparent border-none p-0 cursor-pointer">Sign up</button>
                            ) : (
                                <Link to="/signup" className="text-primary hover:underline font-medium">Sign up</Link>
                            )}
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
