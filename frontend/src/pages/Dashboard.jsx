import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { PlusCircle, FileText, List, ArrowRight, RotateCw } from 'lucide-react';

export default function Dashboard() {
    const [chapters, setChapters] = useState([]);
    const [questionSets, setQuestionSets] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const chaptersRes = await api.get('/chapters/');
                setChapters(chaptersRes.data);
                const questionSetsRes = await api.get('/questionsets/');
                setQuestionSets(questionSetsRes.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground mt-2">Get an overview of your uploaded content and generated exams.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area - Your Content */}
                <Card className="lg:col-span-2 border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Your Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
                                <div className="flex flex-col h-full justify-between gap-4">
                                    <div>
                                        <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg text-primary w-fit mb-4">
                                            <PlusCircle className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2">Practice MCQ</h3>
                                        <p className="text-muted-foreground text-sm">
                                            Upload content to generate MCQs and short questions for practice.
                                        </p>
                                    </div>
                                    <Link to="/upload">
                                        <Button className="w-full rounded-full">
                                            Practice MCQ <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-xl border border-amber-100 dark:border-amber-800">
                                <div className="flex flex-col h-full justify-between gap-4">
                                    <div>
                                        <div className="p-2 bg-amber-100 dark:bg-amber-800 rounded-lg text-amber-600 dark:text-amber-400 w-fit mb-4">
                                            <RotateCw className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2">Flashcards</h3>
                                        <p className="text-muted-foreground text-sm">
                                            Quickly generate flashcards from your notes for rapid review.
                                        </p>
                                    </div>
                                    <Link to="/upload?mode=flashcard">
                                        <Button variant="outline" className="w-full rounded-full border-amber-200 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-400">
                                            Start Flashcards <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                Recent Uploads
                            </h3>
                            {chapters.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic">No chapters uploaded yet.</p>
                            ) : (
                                <div className="grid gap-4">
                                    {chapters.slice(0, 3).map((chapter) => (
                                        <div key={chapter.id} className="flex items-center justify-between p-4 bg-card border rounded-lg hover:shadow-md transition-shadow">
                                            <div>
                                                <p className="font-medium">{chapter.title}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(chapter.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <Link to={`/chapters/${chapter.id}`}>
                                                <Button variant="ghost" size="sm">View</Button>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Sidebar Area - Activity/Stats */}
                <div className="space-y-6">
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Quick Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-4">
                            <div className="p-4 border rounded-lg bg-card">
                                <div className="text-2xl font-bold">{chapters.length}</div>
                                <div className="text-xs text-muted-foreground mt-1">Uploaded Chapters</div>
                            </div>
                            <div className="p-4 border rounded-lg bg-card">
                                <div className="text-2xl font-bold">{questionSets.length}</div>
                                <div className="text-xs text-muted-foreground mt-1">Generated Question Sets</div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-primary/5">
                        <CardHeader>
                            <CardTitle className="text-lg">Recent Exams</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {questionSets.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No exams generated yet.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {questionSets.slice(0, 5).map((qs) => (
                                        <li key={qs.id}>
                                            <Link to={`/questionsets/${qs.id}`} className="block group">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-medium group-hover:text-primary transition-colors truncate max-w-[180px]">{qs.title}</span>
                                                    <span className="text-muted-foreground text-xs">{new Date(qs.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <div className="mt-6 pt-4 border-t border-border/50">
                                <Link to="/questionsets" className="text-sm text-primary hover:underline flex items-center">
                                    View all exams <ArrowRight className="ml-1 h-3 w-3" />
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
