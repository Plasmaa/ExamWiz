import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, FileText, PlusCircle } from 'lucide-react';

export default function ChapterView() {
    const { id } = useParams();
    const [chapter, setChapter] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchChapter = async () => {
            try {
                // We might need a specific endpoint for single chapter, but for now let's assume we can get it from the list or add an endpoint
                // Actually, let's check if we have a get chapter endpoint. 
                // If not, we might need to add one or filter from the list.
                // Checking backend... we only have /chapters/ (list) and /upload/chapter (create).
                // I'll assume I need to add a GET /chapters/{id} endpoint or filter the list.
                // Filtering list is inefficient but works for now if the list is small.
                // Better: Add GET /chapters/{id} to backend.
                // For this step, I'll try to fetch the list and find the chapter.
                const response = await api.get('/chapters/');
                const foundChapter = response.data.find(c => c.id === parseInt(id));
                setChapter(foundChapter);
            } catch (error) {
                console.error("Failed to fetch chapter", error);
            } finally {
                setLoading(false);
            }
        };
        fetchChapter();
    }, [id]);

    const handleGenerate = () => {
        // Navigate to upload page but in "configure" mode? 
        // Or maybe we need a way to start generation from an existing chapter.
        // The current Upload.jsx handles generation but it expects to have just uploaded a file or have a chapterId.
        // If we modify Upload.jsx to accept a chapterId param, we can reuse it.
        // For now, let's just show the content.
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (!chapter) return <div className="p-8">Chapter not found</div>;

    return (
        <div className="space-y-6">
            <div>
                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary flex items-center mb-2">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">{chapter.title}</h1>
                <p className="text-muted-foreground text-sm mt-1">Uploaded on {new Date(chapter.created_at).toLocaleDateString()}</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Content Preview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-muted p-4 rounded-md whitespace-pre-wrap font-mono text-sm max-h-[500px] overflow-y-auto">
                        {chapter.content_text}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
