import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';

export default function ExamView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [questionSet, setQuestionSet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(null);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        const fetchQuestionSet = async () => {
            try {
                const response = await api.get(`/questionsets/${id}`);
                setQuestionSet(response.data);
                if (response.data.time_limit) {
                    setTimeLeft(response.data.time_limit * 60); // Convert minutes to seconds
                }
            } catch (error) {
                console.error("Failed to fetch question set", error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuestionSet();
    }, [id]);

    useEffect(() => {
        if (timeLeft === null || submitted) return;

        if (timeLeft <= 0) {
            handleSubmit();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, submitted]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleAnswerChange = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async () => {
        let calculatedScore = 0;
        questionSet.questions.forEach(q => {
            if (answers[q.id] === q.correct_answer) {
                calculatedScore++;
            }
        });
        setScore(calculatedScore);
        setSubmitted(true);
        window.scrollTo(0, 0);

        // Save attempt
        try {
            const attemptData = {
                question_set_id: parseInt(id),
                score: calculatedScore,
                total_questions: questionSet.questions.length,
                answers: answers
            };
            const response = await api.post('/attempts/', attemptData);
            // Optional: Navigate to result view immediately or let user review here
            navigate(`/results/${response.data.id}`);
        } catch (error) {
            console.error("Failed to save attempt", error);
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;
    if (!questionSet) return <div className="p-8 text-center text-muted-foreground">Exam not found</div>;

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="sticky top-16 z-30 bg-background/95 backdrop-blur py-4 border-b flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{questionSet.title}</h1>
                    <p className="text-muted-foreground text-sm">
                        {submitted ? "Exam Completed" : "Time Remaining:"}
                        {!submitted && (
                            <span className={`ml-2 font-mono font-bold text-lg ${timeLeft < 60 ? 'text-destructive' : 'text-primary'}`}>
                                {formatTime(timeLeft)}
                            </span>
                        )}
                    </p>
                </div>
                {submitted && (
                    <Link to="/dashboard">
                        <Button variant="outline">Back to Dashboard</Button>
                    </Link>
                )}
            </div>

            {submitted && (
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-6 text-center">
                        <h2 className="text-2xl font-bold mb-2">Your Score</h2>
                        <div className="text-4xl font-bold text-primary mb-2">
                            {score} / {questionSet.questions.length}
                        </div>
                        <p className="text-muted-foreground">
                            ({Math.round((score / questionSet.questions.length) * 100)}%)
                        </p>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-6 pt-8 pb-20">
                {questionSet.questions.map((q, index) => (
                    <Card key={q.id} className={`border shadow-sm ${submitted ? (answers[q.id] === q.correct_answer ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30') : ''}`}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-medium leading-relaxed flex gap-2">
                                <span className="text-muted-foreground">{index + 1}.</span>
                                <span>{q.question_text}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup
                                value={answers[q.id]}
                                onValueChange={(val) => !submitted && handleAnswerChange(q.id, val)}
                                className="space-y-3 mt-2"
                            >
                                {(() => {
                                    try {
                                        const options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
                                        return options.map((opt, i) => (
                                            <div key={i} className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${submitted
                                                ? opt === q.correct_answer
                                                    ? 'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-800'
                                                    : answers[q.id] === opt
                                                        ? 'bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-800'
                                                        : 'border-transparent'
                                                : answers[q.id] === opt
                                                    ? 'bg-primary/5 border-primary'
                                                    : 'border-transparent hover:bg-accent'
                                                }`}>
                                                <RadioGroupItem value={opt} id={`q${q.id}-opt${i}`} disabled={submitted} />
                                                <Label htmlFor={`q${q.id}-opt${i}`} className="flex-1 cursor-pointer font-normal">
                                                    {opt}
                                                    {submitted && opt === q.correct_answer && (
                                                        <CheckCircle className="inline-block ml-2 h-4 w-4 text-green-600" />
                                                    )}
                                                    {submitted && answers[q.id] === opt && opt !== q.correct_answer && (
                                                        <XCircle className="inline-block ml-2 h-4 w-4 text-red-600" />
                                                    )}
                                                </Label>
                                            </div>
                                        ));
                                    } catch (e) {
                                        return <p className="text-destructive">Error parsing options</p>;
                                    }
                                })()}
                            </RadioGroup>

                            {submitted && answers[q.id] !== q.correct_answer && (
                                <div className="mt-4 p-3 bg-background rounded-md border text-sm">
                                    <span className="font-semibold text-primary">Correct Answer:</span> {q.correct_answer}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
                {!submitted && (
                    <div className="flex justify-center pt-8">
                        <Button onClick={handleSubmit} size="lg" className="w-full md:w-auto min-w-[200px]">Submit Exam</Button>
                    </div>
                )}
            </div>
        </div>
    );
}
