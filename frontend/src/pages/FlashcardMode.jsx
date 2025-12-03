import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';

export default function FlashcardMode() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [questionSet, setQuestionSet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

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

    const handleNext = () => {
        if (currentIndex < (questionSet?.questions?.length || 0) - 1) {
            setIsFlipped(false);
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setIsFlipped(false);
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                handleFlip();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, isFlipped, questionSet]);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;
    if (!questionSet || !questionSet.questions || questionSet.questions.length === 0) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <p className="text-muted-foreground">No questions found to study.</p>
            <Button onClick={() => navigate(`/questionsets/${id}`)}>Back to Set</Button>
        </div>
    );

    const currentQuestion = questionSet.questions[currentIndex];

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="border-b p-4">
                <div className="container mx-auto max-w-4xl flex items-center justify-between">
                    <Link to={`/questionsets/${id}`} className="text-sm text-muted-foreground hover:text-primary flex items-center">
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Set
                    </Link>
                    <div className="font-medium">
                        {currentIndex + 1} / {questionSet.questions.length}
                    </div>
                    <div className="w-[100px]"></div> {/* Spacer for centering */}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-4 container mx-auto max-w-4xl">
                <div
                    className="w-full max-w-2xl aspect-[3/2] perspective-1000 cursor-pointer group"
                    onClick={handleFlip}
                >
                    <div className={`relative w-full h-full transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                        {/* Front (Question) */}
                        <Card className="absolute w-full h-full backface-hidden flex flex-col items-center justify-center p-8 text-center shadow-lg border-2 hover:border-primary/50 transition-colors">
                            <div className="absolute top-4 left-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Question</div>
                            <h2 className="text-2xl md:text-3xl font-semibold leading-relaxed">
                                {currentQuestion.question_text}
                            </h2>
                            <div className="absolute bottom-4 text-sm text-muted-foreground flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                <RotateCw className="h-4 w-4" /> Click to flip
                            </div>
                        </Card>

                        {/* Back (Answer) */}
                        <Card className="absolute w-full h-full backface-hidden rotate-y-180 flex flex-col items-center justify-center p-8 text-center shadow-lg border-2 bg-primary/5">
                            <div className="absolute top-4 left-4 text-xs font-bold text-primary uppercase tracking-wider">Answer</div>
                            <div className="text-xl md:text-2xl font-medium leading-relaxed">
                                {currentQuestion.correct_answer}
                            </div>
                            {currentQuestion.question_type === 'MCQ' && (
                                <div className="mt-4 text-sm text-muted-foreground">
                                    (Option from MCQ)
                                </div>
                            )}
                        </Card>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-8 mt-12">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 rounded-full"
                        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                        disabled={currentIndex === 0}
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </Button>

                    <Button
                        size="lg"
                        className="min-w-[140px] h-12 rounded-full text-lg"
                        onClick={(e) => { e.stopPropagation(); handleFlip(); }}
                    >
                        {isFlipped ? 'Show Question' : 'Show Answer'}
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 rounded-full"
                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
                        disabled={currentIndex === questionSet.questions.length - 1}
                    >
                        <ChevronRight className="h-6 w-6" />
                    </Button>
                </div>

                <div className="mt-8 text-sm text-muted-foreground">
                    Press <kbd className="px-2 py-1 bg-muted rounded border text-xs">Space</kbd> to flip, <kbd className="px-2 py-1 bg-muted rounded border text-xs">←</kbd> <kbd className="px-2 py-1 bg-muted rounded border text-xs">→</kbd> to navigate
                </div>
            </main>
        </div>
    );
}
