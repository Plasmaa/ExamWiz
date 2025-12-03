import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Download, Printer, FileText, ArrowLeft, Eye, EyeOff, Layers } from 'lucide-react';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch'; // Assuming we have a Switch component, if not I'll use a checkbox styled nicely

export default function QuestionSet() {
    const { id } = useParams();
    const [questionSet, setQuestionSet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [visibleAnswers, setVisibleAnswers] = useState(new Set());

    const allQuestionIds = questionSet?.questions?.map(q => q.id) || [];
    const isAllVisible = allQuestionIds.length > 0 && visibleAnswers.size === allQuestionIds.length;

    useEffect(() => {
        const fetchQuestionSet = async () => {
            try {
                const response = await api.get(`/questionsets/${id}`);
                setQuestionSet(response.data);
            } catch (error) {
                console.error("Failed to fetch question set", error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuestionSet();
    }, [id]);

    const handleExport = async (format) => {
        try {
            const response = await api.get(`/export/${id}/${format}`, {
                params: { include_answers: visibleAnswers.size > 0 },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${questionSet.title}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Export failed", error);
        }
    };

    const toggleAnswer = (questionId) => {
        setVisibleAnswers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(questionId)) {
                newSet.delete(questionId);
            } else {
                newSet.add(questionId);
            }
            return newSet;
        });
    };

    const toggleAllAnswers = (checked) => {
        if (checked) {
            setVisibleAnswers(new Set(allQuestionIds));
        } else {
            setVisibleAnswers(new Set());
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;
    if (!questionSet) return <div className="p-8 text-center text-muted-foreground">Question Set not found</div>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary flex items-center mb-2">
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">{questionSet.title}</h1>
                    <p className="text-muted-foreground text-sm mt-1">Generated on {new Date(questionSet.created_at).toLocaleDateString()}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center space-x-2 bg-card border rounded-lg px-3 py-2 mr-2">
                        <Switch
                            id="answers"
                            checked={isAllVisible}
                            onCheckedChange={toggleAllAnswers}
                        />
                        <Label htmlFor="answers" className="cursor-pointer flex items-center gap-2 text-sm font-medium">
                            {isAllVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            Show All Answers
                        </Label>
                    </div>

                    <div className="flex items-center gap-2">

                        <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
                            <Printer className="mr-2 h-4 w-4" /> PDF
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleExport('docx')}>
                            <FileText className="mr-2 h-4 w-4" /> DOCX
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleExport('txt')}>
                            <Download className="mr-2 h-4 w-4" /> TXT
                        </Button>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {questionSet.questions && Array.isArray(questionSet.questions) ? (
                    questionSet.questions.map((q, index) => (
                        <Card key={q.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start gap-4">
                                    <CardTitle className="text-lg font-medium leading-relaxed">
                                        <span className="text-muted-foreground mr-2">{index + 1}.</span>
                                        {q.question_text}
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 px-2 text-muted-foreground hover:text-primary"
                                            onClick={() => toggleAnswer(q.id)}
                                            title={visibleAnswers.has(q.id) ? "Hide Answer" : "Show Answer"}
                                        >
                                            {visibleAnswers.has(q.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap border ${q.difficulty === 'Hard' ? 'bg-white text-red-600 border-red-200 dark:bg-red-900/10 dark:text-red-300 dark:border-red-800' :
                                            q.difficulty === 'Medium' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' :
                                                'bg-white text-emerald-600 border-emerald-200 dark:bg-emerald-900/10 dark:text-emerald-300 dark:border-emerald-800'
                                            }`}>
                                            {q.question_type}
                                        </span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {q.question_type === 'MCQ' && (
                                    <div className="mt-2 pl-6">
                                        <ul className="space-y-2">
                                            {(() => {
                                                try {
                                                    const options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
                                                    if (Array.isArray(options)) {
                                                        return options.map((opt, i) => (
                                                            <li key={i} className={`flex items-center gap-3 p-2 rounded-md text-sm ${visibleAnswers.has(q.id) && opt === q.correct_answer
                                                                ? "bg-blue-50/40 text-blue-700 font-medium border border-blue-100 dark:bg-blue-900/10 dark:text-blue-300 dark:border-blue-800"
                                                                : "text-muted-foreground"
                                                                }`}>
                                                                <div className={`h-4 w-4 rounded-full border flex items-center justify-center text-[10px] ${visibleAnswers.has(q.id) && opt === q.correct_answer
                                                                    ? "border-blue-500 bg-blue-500 text-white"
                                                                    : "border-muted-foreground"
                                                                    }`}>
                                                                    {String.fromCharCode(65 + i)}
                                                                </div>
                                                                {opt}
                                                            </li>
                                                        ));
                                                    }
                                                    return <li className="text-destructive text-sm">Error: Invalid options format</li>;
                                                } catch (e) {
                                                    return <li className="text-destructive text-sm">Error parsing options</li>;
                                                }
                                            })()}
                                        </ul>
                                    </div>
                                )}
                                {visibleAnswers.has(q.id) && (
                                    <div className="mt-4 pt-4 border-t border-border/50 pl-6">
                                        <div className="text-sm">
                                            <span className="font-semibold text-primary">Correct Answer:</span>
                                            <span className="ml-2 text-foreground">{q.correct_answer}</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-12 bg-card rounded-lg border border-dashed">
                        <p className="text-muted-foreground">No questions found in this set.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
