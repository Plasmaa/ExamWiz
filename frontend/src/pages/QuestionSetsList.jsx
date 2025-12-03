import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, FileText, ArrowRight } from 'lucide-react';

export default function QuestionSetsList() {
    const [questionSets, setQuestionSets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuestionSets = async () => {
            try {
                const response = await api.get('/questionsets/');
                setQuestionSets(response.data);
            } catch (error) {
                console.error("Failed to fetch question sets", error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuestionSets();
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
                    questionSets.map((qs) => (
                        <Card key={qs.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary mt-1">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">{qs.title}</h3>
                                        <p className="text-sm text-muted-foreground">Generated on {new Date(qs.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <Link to={`/questionsets/${qs.id}`} className="w-full md:w-auto">
                                    <Button className="w-full md:w-auto">
                                        View Exam <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
