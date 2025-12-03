import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Upload as UploadIcon, Loader2, FileType, Settings } from 'lucide-react';

export default function Upload() {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Upload, 2: Configure
    const [chapterId, setChapterId] = useState(null);

    // Generation Options
    const [numMcqs, setNumMcqs] = useState(5);
    const [numShort, setNumShort] = useState(3);
    const [numFlashcards, setNumFlashcards] = useState(10);
    const [difficulty, setDifficulty] = useState('Medium');

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const mode = searchParams.get('mode');
    const isFlashcardMode = mode === 'flashcard';

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || !title) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);

        try {
            const response = await api.post(`/upload/chapter?title=${encodeURIComponent(title)}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setChapterId(response.data.id);
            setStep(2);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const params = isFlashcardMode ? {
                num_mcqs: 0,
                num_short: numFlashcards,
                difficulty: 'Medium'
            } : {
                num_mcqs: numMcqs,
                num_short: 0,
                difficulty: 'Medium'
            };

            const response = await api.post(`/generate/${chapterId}`, null, {
                params: params
            });
            if (isFlashcardMode) {
                navigate(`/flashcards/${response.data.question_set_id}`);
            } else {
                navigate(`/questionsets/${response.data.question_set_id}`);
            }
        } catch (error) {
            console.error("Generation failed", error);
            alert("Generation failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">{isFlashcardMode ? "Create Flashcards" : "New Exam"}</h1>
                <p className="text-muted-foreground mt-2">{isFlashcardMode ? "Upload content to generate flashcards for quick study." : "Upload content and configure your exam settings."}</p>
            </div>

            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {step === 1 ? <FileType className="h-5 w-5 text-primary" /> : <Settings className="h-5 w-5 text-primary" />}
                        {step === 1 ? "Upload Content" : "Configure Exam"}
                    </CardTitle>
                    <CardDescription>
                        {step === 1
                            ? "Upload a PDF, Image, or Text file to generate questions."
                            : isFlashcardMode
                                ? "Choose how many flashcards you want to generate."
                                : "Choose how many MCQs you want to practice."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {step === 1 ? (
                        <form onSubmit={handleUpload} className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Chapter Title</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. Chapter 1: Photosynthesis"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    className="max-w-md"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="file">File</Label>
                                <div className="border-2 border-dashed border-input rounded-lg p-8 text-center hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => document.getElementById('file').click()}>
                                    <Input
                                        id="file"
                                        type="file"
                                        onChange={handleFileChange}
                                        required
                                        accept=".pdf,.png,.jpg,.jpeg,.txt"
                                        className="hidden"
                                    />
                                    <div className="flex flex-col items-center gap-2">
                                        <UploadIcon className="h-8 w-8 text-muted-foreground" />
                                        <p className="text-sm font-medium">
                                            {file ? file.name : "Click to upload or drag and drop"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">PDF, PNG, JPG or TXT</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={loading} className="min-w-[150px]">
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    {loading ? "Processing..." : "Continue"}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-6 max-w-md">
                            <div className="grid gap-4">
                                {isFlashcardMode ? (
                                    <div className="grid gap-2">
                                        <Label>Number of Flashcards (Max 100)</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={numFlashcards}
                                            onChange={(e) => setNumFlashcards(parseInt(e.target.value))}
                                        />
                                    </div>
                                ) : (
                                    <div className="grid gap-2">
                                        <Label>Number of MCQs (Max 20)</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            max="20"
                                            value={numMcqs}
                                            onChange={(e) => setNumMcqs(parseInt(e.target.value))}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                                <Button onClick={handleGenerate} disabled={loading} className="min-w-[150px]">
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    {loading ? "Generating..." : "Generate Questions"}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
