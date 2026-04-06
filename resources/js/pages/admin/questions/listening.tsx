import AdminLayout from '@/layouts/admin-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Plus, 
    Edit, 
    Trash2,
    BookOpen,
    FileText,
    ChevronDown,
    ChevronRight,
    CheckCircle,
    Circle,
    Volume2,
    Upload
} from 'lucide-react';
import { useState, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

interface Passage {
    id: number;
    title: string;
    content: string;
    audio_url?: string | null;
    type: string;
    order: number;
    questionCount: number;
    questions: Question[];
}

interface Question {
    id: number;
    question_text: string;
    question_type: string;
    order: number;
    points: number;
    choicesCount: number;
    choices?: QuestionChoice[];
}

interface QuestionChoice {
    id: number;
    choice_label: string;
    choice_text: string;
    is_correct: boolean;
}

interface Props {
    section: string;
    subtest: {
        id: number;
        name: string;
    };
    passages: Passage[];
    standaloneQuestions: Question[];
}

export default function ReadingQuestions({ section, subtest, passages, standaloneQuestions }: Props) {
    const [openPassageDialog, setOpenPassageDialog] = useState(false);
    const [openQuestionDialog, setOpenQuestionDialog] = useState(false);
    const [editingPassage, setEditingPassage] = useState<Passage | null>(null);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [selectedPassageId, setSelectedPassageId] = useState<number | null>(null);
    const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [audioPreview, setAudioPreview] = useState<string | null>(null);
    const audioInputRef = useRef<HTMLInputElement>(null);

    const toggleChoicesExpand = (questionId: number) => {
        setExpandedQuestions(prev => {
            const next = new Set(prev);
            if (next.has(questionId)) {
                next.delete(questionId);
            } else {
                next.add(questionId);
            }
            return next;
        });
    };

    const passageForm = useForm({
        subtest_id: subtest.id,
        title: '',
        content: '',
        type: section,
        order: 0,
        audio: null as File | null,
    });

    const questionForm = useForm({
        passage_id: null as number | null,
        subtest_id: subtest.id,
        question_text: '',
        question_type: 'multiple_choice',
        order: 0,
        points: 1,
        choices: [
            { choice_label: 'A', choice_text: '', is_correct: false as boolean },
            { choice_label: 'B', choice_text: '', is_correct: false as boolean },
            { choice_label: 'C', choice_text: '', is_correct: false as boolean },
            { choice_label: 'D', choice_text: '', is_correct: false as boolean },
        ],
    });

    const handleCreatePassage = () => {
        passageForm.post(route('admin.passages.store'), {
            forceFormData: true,
            onSuccess: () => {
                setOpenPassageDialog(false);
                passageForm.reset();
                setAudioFile(null);
                setAudioPreview(null);
            },
        });
    };

    const handleUpdatePassage = () => {
        if (!editingPassage) return;
        
        passageForm.put(route('admin.passages.update', editingPassage.id), {
            forceFormData: true,
            onSuccess: () => {
                setOpenPassageDialog(false);
                setEditingPassage(null);
                passageForm.reset();
                setAudioFile(null);
                setAudioPreview(null);
            },
        });
    };

    const handleDeletePassage = (id: number) => {
        if (confirm('Are you sure? This will also delete all questions in this passage.')) {
            router.delete(route('admin.passages.delete', id));
        }
    };

    const handleCreateQuestion = () => {
        questionForm.post(route('admin.questions.store'), {
            onSuccess: () => {
                setOpenQuestionDialog(false);
                questionForm.reset();
                setSelectedPassageId(null);
            },
        });
    };

    const handleDeleteQuestion = (id: number) => {
        if (confirm('Are you sure you want to delete this question?')) {
            router.delete(route('admin.questions.delete', id));
        }
    };

    const openCreatePassageDialog = () => {
        setEditingPassage(null);
        passageForm.reset();
        setAudioFile(null);
        setAudioPreview(null);
        setOpenPassageDialog(true);
    };

    const openEditPassageDialog = (passage: Passage) => {
        setEditingPassage(passage);
        passageForm.setData({
            subtest_id: subtest.id,
            title: passage.title,
            content: passage.content,
            type: passage.type,
            order: passage.order,
            audio: null,
        });
        setAudioFile(null);
        setAudioPreview(passage.audio_url || null);
        setOpenPassageDialog(true);
    };

    const openCreateQuestionDialog = (passageId: number | null = null) => {
        setEditingQuestion(null);
        setSelectedPassageId(passageId);
        questionForm.setData({
            ...questionForm.data,
            passage_id: passageId,
        });
        setOpenQuestionDialog(true);
    };

    return (
        <AdminLayout
            breadcrumbs={[
                { title: 'Admin', href: '/admin' },
                { title: 'Questions', href: '/admin/questions/reading' },
                { title: subtest.name, href: `/admin/questions/${section}` },
            ]}
        >
            <Head title={`${subtest.name} Questions`} />

            <div className="space-y-6 p-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{subtest.name} Questions</h1>
                        <p className="text-muted-foreground">
                            Manage audio passages and questions for the listening section
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={openCreatePassageDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Audio Passage
                        </Button>
                        <Button variant="outline" onClick={() => openCreateQuestionDialog()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Standalone Question
                        </Button>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Total Passages</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{passages.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {passages.reduce((sum, p) => sum + p.questionCount, 0) + standaloneQuestions.length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Standalone Questions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{standaloneQuestions.length}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Passages List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Passages & Questions</CardTitle>
                        <CardDescription>Click on a passage to expand and view questions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {passages.length === 0 ? (
                            <div className="text-center py-12">
                                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">No passages yet</h3>
                                <p className="text-muted-foreground">Create your first passage to get started</p>
                                <Button className="mt-4" onClick={openCreatePassageDialog}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Passage
                                </Button>
                            </div>
                        ) : (
                            <Accordion type="single" collapsible className="w-full">
                                {passages.map((passage) => (
                                    <AccordionItem key={passage.id} value={`passage-${passage.id}`}>
                                        <AccordionTrigger>
                                            <div className="flex items-center justify-between w-full pr-4">
                                                <div className="flex items-center gap-3">
                                                    <Volume2 className="h-5 w-5 text-blue-600" />
                                                    <div className="text-left">
                                                        <p className="font-semibold">{passage.title}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {passage.questionCount} questions
                                                            {passage.audio_url && (
                                                                <span className="ml-2 text-blue-600">· 🔊 Audio uploaded</span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openEditPassageDialog(passage);
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeletePassage(passage.id);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="space-y-4 pl-8 pt-4">
                                                {/* Audio Player */}
                                                <div className="rounded-lg border bg-muted/50 p-4">
                                                    {passage.audio_url ? (
                                                        <div className="space-y-2">
                                                            <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                                                                <Volume2 className="h-3 w-3" /> Audio File
                                                            </p>
                                                            <audio controls className="w-full" src={passage.audio_url}>
                                                                Your browser does not support the audio element.
                                                            </audio>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-muted-foreground italic flex items-center gap-2">
                                                            <Upload className="h-4 w-4" />
                                                            No audio uploaded yet. Edit the passage to upload an audio file.
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Questions */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-semibold">Questions</h4>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => openCreateQuestionDialog(passage.id)}
                                                        >
                                                            <Plus className="mr-2 h-4 w-4" />
                                                            Add Question
                                                        </Button>
                                                    </div>

                                                    {passage.questions.length === 0 ? (
                                                        <p className="text-sm text-muted-foreground py-4">
                                                            No questions yet
                                                        </p>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {passage.questions.map((question, idx) => (
                                                                <div
                                                                    key={question.id}
                                                                    className="rounded-lg border"
                                                                >
                                                                    <div className="flex items-center justify-between p-3">
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center gap-2">
                                                                                <Badge variant="outline">Q{idx + 1}</Badge>
                                                                                <p className="text-sm font-medium line-clamp-1">
                                                                                    {question.question_text}
                                                                                </p>
                                                                            </div>
                                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                                {question.choicesCount} choices · {question.points} point(s)
                                                                            </p>
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                            {question.question_type === 'multiple_choice' && question.choicesCount > 0 && (
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    onClick={() => toggleChoicesExpand(question.id)}
                                                                                    title="View choices"
                                                                                >
                                                                                    {expandedQuestions.has(question.id)
                                                                                        ? <ChevronDown className="h-4 w-4" />
                                                                                        : <ChevronRight className="h-4 w-4" />
                                                                                    }
                                                                                </Button>
                                                                            )}
                                                                            <Button variant="ghost" size="sm">
                                                                                <Edit className="h-4 w-4" />
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="text-red-600"
                                                                                onClick={() => handleDeleteQuestion(question.id)}
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                    {/* Choices panel */}
                                                                    {expandedQuestions.has(question.id) && question.choices && question.choices.length > 0 && (
                                                                        <div className="border-t bg-muted/30 px-4 py-3 space-y-1">
                                                                            <p className="text-xs font-semibold text-muted-foreground mb-2">Answer Choices:</p>
                                                                            {question.choices.map((choice) => (
                                                                                <div
                                                                                    key={choice.id}
                                                                                    className={`flex items-start gap-2 rounded px-2 py-1 text-sm ${
                                                                                        choice.is_correct
                                                                                            ? 'bg-green-50 text-green-800 font-medium'
                                                                                            : 'text-muted-foreground'
                                                                                    }`}
                                                                                >
                                                                                    {choice.is_correct
                                                                                        ? <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-green-600" />
                                                                                        : <Circle className="h-4 w-4 mt-0.5 shrink-0" />
                                                                                    }
                                                                                    <span>
                                                                                        <span className="font-semibold">{choice.choice_label}.</span>{' '}{choice.choice_text}
                                                                                        {choice.is_correct && <span className="ml-2 text-xs text-green-600">(Correct)</span>}
                                                                                    </span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        )}
                    </CardContent>
                </Card>

                {/* Standalone Questions */}
                {standaloneQuestions.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Standalone Questions</CardTitle>
                            <CardDescription>Questions without passages</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {standaloneQuestions.map((question, idx) => (
                                    <div
                                        key={question.id}
                                        className="rounded-lg border"
                                    >
                                        <div className="flex items-center justify-between p-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge>Q{idx + 1}</Badge>
                                                    <p className="font-medium">{question.question_text}</p>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {question.choices?.length || 0} choices · {question.points} point(s)
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {question.choices && question.choices.length > 0 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleChoicesExpand(question.id)}
                                                        title="View choices"
                                                    >
                                                        {expandedQuestions.has(question.id)
                                                            ? <ChevronDown className="h-4 w-4" />
                                                            : <ChevronRight className="h-4 w-4" />
                                                        }
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600"
                                                    onClick={() => handleDeleteQuestion(question.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        {/* Choices panel */}
                                        {expandedQuestions.has(question.id) && question.choices && question.choices.length > 0 && (
                                            <div className="border-t bg-muted/30 px-4 py-3 space-y-1">
                                                <p className="text-xs font-semibold text-muted-foreground mb-2">Answer Choices:</p>
                                                {question.choices.map((choice) => (
                                                    <div
                                                        key={choice.id}
                                                        className={`flex items-start gap-2 rounded px-2 py-1 text-sm ${
                                                            choice.is_correct
                                                                ? 'bg-green-50 text-green-800 font-medium'
                                                                : 'text-muted-foreground'
                                                        }`}
                                                    >
                                                        {choice.is_correct
                                                            ? <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-green-600" />
                                                            : <Circle className="h-4 w-4 mt-0.5 shrink-0" />
                                                        }
                                                        <span>
                                                            <span className="font-semibold">{choice.choice_label}.</span>{' '}{choice.choice_text}
                                                            {choice.is_correct && <span className="ml-2 text-xs text-green-600">(Correct)</span>}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Create/Edit Passage Dialog */}
            <Dialog open={openPassageDialog} onOpenChange={setOpenPassageDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingPassage ? 'Edit Audio Passage' : 'Create New Audio Passage'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingPassage ? 'Update passage information and audio file' : 'Add a new listening audio passage'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={passageForm.data.title}
                                onChange={(e) => passageForm.setData('title', e.target.value)}
                                placeholder="e.g. Conversation: Student and Advisor"
                            />
                        </div>
                        <div>
                            <Label htmlFor="audio">
                                Audio File <span className="text-muted-foreground text-xs">(MP3, WAV, OGG, M4A – max 50 MB)</span>
                            </Label>
                            {/* Current audio preview */}
                            {audioPreview && !audioFile && (
                                <div className="mt-2 mb-2 rounded-lg border bg-muted/50 p-3">
                                    <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                                        <Volume2 className="h-3 w-3" /> Current audio:
                                    </p>
                                    <audio controls className="w-full" src={audioPreview} />
                                </div>
                            )}
                            {/* New file selected preview */}
                            {audioFile && (
                                <div className="mt-2 mb-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
                                    <p className="text-xs font-semibold text-blue-700 mb-1">New file selected: {audioFile.name}</p>
                                    <audio controls className="w-full" src={URL.createObjectURL(audioFile)} />
                                </div>
                            )}
                            <div
                                className="mt-2 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                                onClick={() => audioInputRef.current?.click()}
                            >
                                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">
                                    {audioFile ? 'Click to replace audio file' : 'Click to upload audio file'}
                                </p>
                                <input
                                    ref={audioInputRef}
                                    type="file"
                                    accept="audio/mp3,audio/mpeg,audio/wav,audio/ogg,audio/m4a,audio/aac"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] ?? null;
                                        setAudioFile(file);
                                        passageForm.setData('audio', file);
                                    }}
                                />
                            </div>
                            {passageForm.errors.audio && (
                                <p className="text-sm text-red-600 mt-1">{passageForm.errors.audio}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="order">Order</Label>
                            <Input
                                id="order"
                                type="number"
                                value={passageForm.data.order}
                                onChange={(e) => passageForm.setData('order', parseInt(e.target.value))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setOpenPassageDialog(false);
                                setEditingPassage(null);
                                passageForm.reset();
                                setAudioFile(null);
                                setAudioPreview(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={editingPassage ? handleUpdatePassage : handleCreatePassage}
                            disabled={passageForm.processing}
                        >
                            {editingPassage ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Question Dialog */}
            <Dialog open={openQuestionDialog} onOpenChange={setOpenQuestionDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New Question</DialogTitle>
                        <DialogDescription>
                            {selectedPassageId ? 'Add question to passage' : 'Add standalone question'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="question_text">Question Text</Label>
                            <Textarea
                                id="question_text"
                                value={questionForm.data.question_text}
                                onChange={(e) => questionForm.setData('question_text', e.target.value)}
                                placeholder="Enter question"
                                rows={3}
                            />
                        </div>

                        {/* Choices */}
                        <div>
                            <Label>Answer Choices</Label>
                            <div className="space-y-2 mt-2">
                                {questionForm.data.choices.map((choice, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <Badge variant="outline">{choice.choice_label}</Badge>
                                        <Input
                                            value={choice.choice_text}
                                            onChange={(e) => {
                                                const newChoices = [...questionForm.data.choices];
                                                newChoices[index].choice_text = e.target.value;
                                                questionForm.setData('choices', newChoices);
                                            }}
                                            placeholder={`Option ${choice.choice_label}`}
                                        />
                                        <Button
                                            type="button"
                                            variant={choice.is_correct ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => {
                                                const newChoices = questionForm.data.choices.map((c, i) => ({
                                                    ...c,
                                                    is_correct: i === index,
                                                }));
                                                questionForm.setData('choices', newChoices);
                                            }}
                                        >
                                            {choice.is_correct ? '✓ Correct' : 'Mark Correct'}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="order">Order</Label>
                                <Input
                                    id="order"
                                    type="number"
                                    value={questionForm.data.order}
                                    onChange={(e) => questionForm.setData('order', parseInt(e.target.value))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="points">Points</Label>
                                <Input
                                    id="points"
                                    type="number"
                                    value={questionForm.data.points}
                                    onChange={(e) => questionForm.setData('points', parseInt(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setOpenQuestionDialog(false);
                                questionForm.reset();
                                setSelectedPassageId(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleCreateQuestion} disabled={questionForm.processing}>
                            Create Question
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
