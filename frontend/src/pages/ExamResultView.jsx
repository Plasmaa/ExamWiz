import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

export default function ExamResultView() {
    const { id } = useParams();
    const [attempt, setAttempt] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttempt = async () => {
            try {
                const response = await api.get(`/attempts/${id}`);
                setAttempt(response.data);
            } catch (error) {
                console.error("Failed to fetch attempt", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAttempt();
    }, [id]);

    if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;
    if (!attempt) return <div className="p-8 text-center">Attempt not found</div>;

    const answers = JSON.parse(attempt.answers);

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div>
                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary flex items-center mb-2">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Exam Results</h1>
                        <p className="text-muted-foreground mt-2">
                            {attempt.question_set.title} • {new Date(attempt.completed_at).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-primary">{attempt.score} / {attempt.total_questions}</div>
                        <p className="text-sm text-muted-foreground">Score</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {attempt.question_set.questions.map((q, index) => {
                    const userAnswer = answers[q.id];
                    const isCorrect = userAnswer === q.correct_answer;

                    return (
                        <Card key={q.id} className={`border-l-4 ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
                            <CardHeader>
                                <CardTitle className="text-lg font-medium flex gap-3">
                                    <span className="text-muted-foreground">{index + 1}.</span>
                                    <span>{q.question_text}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid gap-2">
                                    {JSON.parse(q.options).map((option, optIndex) => {
                                        const isSelected = userAnswer === option;
                                        const isCorrectOption = q.correct_answer === option;

                                        let className = "p-3 rounded-md border flex items-center justify-between ";
                                        if (isCorrectOption) {
                                            className += "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400";
                                        } else if (isSelected && !isCorrectOption) {
                                            className += "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400";
                                        } else {
                                            className += "bg-card hover:bg-accent/50";
                                        }

                                        return (
                                            <div key={optIndex} className={className}>
                                                <span>{option}</span>
                                                {isCorrectOption && <CheckCircle className="h-4 w-4 text-green-600" />}
                                                {isSelected && !isCorrectOption && <XCircle className="h-4 w-4 text-red-600" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
