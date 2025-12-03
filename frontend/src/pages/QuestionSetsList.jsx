import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, FileText, ArrowRight, RotateCw } from 'lucide-react';

export default function QuestionSetsList() {
    const [questionSets, setQuestionSets] = useState([]);
    const [attempts, setAttempts] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [qsRes, attemptsRes] = await Promise.all([
                    api.get('/questionsets/'),
                    api.get('/attempts/user/')
                ]);
                setQuestionSets(qsRes.data);

                // Map attempts by question_set_id
                const attemptsMap = {};
                attemptsRes.data.forEach(attempt => {
                    // Keep the latest attempt if multiple
                    if (!attemptsMap[attempt.question_set_id]) {
                        attemptsMap[attempt.question_set_id] = attempt;
                    }
                });
                setAttempts(attemptsMap);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;

    return (
        <div className="space-y-8">
            <div>
                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary flex items-center mb-2">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">All Exams</h1>
                <p className="text-muted-foreground mt-2">View and manage all your generated question sets.</p>
            </div>

            <div className="grid gap-4">
                {questionSets.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                            No exams generated yet. Go to the dashboard to create one!
                        </CardContent>
                    </Card>
                ) : (
                    questionSets.map((qs) => {
                        const attempt = attempts[qs.id];
                        return (
                            <Card key={qs.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${qs.is_exam ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' : qs.is_flashcard ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'}`}>
                                            {qs.is_exam ? <RotateCw className="h-5 w-5" /> : qs.is_flashcard ? <RotateCw className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-lg">{qs.title}</h3>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${qs.is_exam ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : qs.is_flashcard ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                                    {qs.is_exam ? 'Exam' : qs.is_flashcard ? 'Flashcard' : 'MCQ'}
                                                </span>
                                                {attempt && (
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                        Score: {attempt.score}/{attempt.total_questions}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">Generated on {new Date(qs.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full md:w-auto">
                                        {qs.is_exam && attempt && (
                                            <Link to={`/results/${attempt.id}`} className="w-full md:w-auto">
                                                <Button variant="outline" className="w-full md:w-auto">
                                                    Results
                                                </Button>
                                            </Link>
                                        )}
                                        <Link to={qs.is_flashcard ? `/flashcards/${qs.id}` : qs.is_exam ? `/exam/${qs.id}` : `/questionsets/${qs.id}`} className="w-full md:w-auto">
                                            <Button className="w-full md:w-auto">
                                                {qs.is_exam ? (attempt ? "Retake Exam" : "Take Exam") : qs.is_flashcard ? "View Flashcards" : "View Questions"} <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })
                )}
            </div>
        </div>
    );
}
