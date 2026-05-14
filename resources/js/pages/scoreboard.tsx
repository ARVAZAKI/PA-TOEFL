import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Award, BarChart3, BookOpen, Download, Home, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface ScoreData {
    username?: string;
    readingScore: number;
    listeningScore: number;
    speakingScore: number;
    writingScore: number;
    readingCorrectCount?: number;
    readingTotalQuestions?: number;
    listeningCorrectCount?: number;
    listeningTotalQuestions?: number;
}

declare global {
    interface Window {
        jspdf?: {
            jsPDF: new (options?: { orientation?: string; unit?: string; format?: string }) => any;
        };
    }
}

export default function Scoreboard() {
    const { props } = usePage();
    const {
        username,
        readingScore = 0,
        listeningScore = 0,
        speakingScore = 0,
        writingScore = 0,
        readingCorrectCount,
        readingTotalQuestions,
        listeningCorrectCount,
        listeningTotalQuestions,
    } = props as unknown as ScoreData;

    const [isGenerating, setIsGenerating] = useState(false);

    const totalScore = readingScore + listeningScore + speakingScore + writingScore;
    const maxScore = 30;
    const maxTotalScore = maxScore * 4;

    // Check if all sections are completed (allow 0 scores)
    const allSectionsCompleted = readingScore >= 0 && listeningScore >= 0 && speakingScore >= 0 && writingScore >= 0;

    const loadScript = (src: string, isReady: () => boolean) =>
        new Promise<void>((resolve, reject) => {
            if (isReady()) {
                resolve();
                return;
            }

            const existingScript = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
            if (existingScript) {
                existingScript.addEventListener('load', () => resolve(), { once: true });
                existingScript.addEventListener('error', () => reject(new Error(`Failed to load script: ${src}`)), { once: true });
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            document.body.appendChild(script);
        });

    const blobToDataUrl = (blob: Blob) =>
        new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    resolve(reader.result);
                    return;
                }

                reject(new Error('Failed to convert blob to data URL.'));
            };
            reader.onerror = () => reject(new Error('Failed to read blob.'));
            reader.readAsDataURL(blob);
        });

    const fetchQrCodeDataUrl = async (targetUrl: string) => {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(targetUrl)}`;
        const response = await fetch(qrUrl);
        if (!response.ok) {
            throw new Error('Failed to generate QR code.');
        }

        const blob = await response.blob();
        return blobToDataUrl(blob);
    };

    const generateCertificate = async () => {
        setIsGenerating(true);

        try {
            await loadScript(
                'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js',
                () => Boolean(window.jspdf?.jsPDF),
            );

            const jsPDF = window.jspdf?.jsPDF;
            if (!jsPDF) {
                throw new Error('PDF library is unavailable.');
            }

            const qrCodeDataUrl = await fetchQrCodeDataUrl('https://toefl.faintry.com');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const centerX = pageWidth / 2;

            pdf.setFillColor(245, 247, 255);
            pdf.rect(8, 8, pageWidth - 16, pageHeight - 16, 'F');
            pdf.setDrawColor(37, 99, 235);
            pdf.setLineWidth(1.2);
            pdf.rect(12, 12, pageWidth - 24, pageHeight - 24);
            pdf.setLineWidth(0.4);
            pdf.rect(16, 16, pageWidth - 32, pageHeight - 32);

            pdf.setTextColor(30, 64, 175);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(28);
            pdf.text('CERTIFICATE', centerX, 33, { align: 'center' });

            pdf.setTextColor(71, 85, 105);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(12);
            pdf.text('TOEFL Practice Test Certificate', centerX, 41, { align: 'center' });

            pdf.setTextColor(100, 116, 139);
            pdf.setFontSize(11);
            pdf.text('This is to certify that', centerX, 58, { align: 'center' });

            pdf.setTextColor(15, 23, 42);
            pdf.setFont('times', 'bold');
            pdf.setFontSize(24);
            pdf.text(username || 'Student', centerX, 70, { align: 'center' });

            pdf.setTextColor(71, 85, 105);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(11);
            pdf.text('has successfully completed the TOEFL Practice Test', centerX, 79, { align: 'center' });

            pdf.setFillColor(37, 99, 235);
            pdf.roundedRect(48, 88, pageWidth - 96, 24, 4, 4, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(12);
            pdf.text('TOTAL SCORE', centerX, 96, { align: 'center' });
            pdf.setFontSize(24);
            pdf.text(`${totalScore}/120`, centerX, 106, { align: 'center' });

            const scoreCards = [
                { label: 'Reading', value: `${readingScore}/30`, x: 24, y: 125 },
                { label: 'Listening', value: `${listeningScore}/30`, x: 108, y: 125 },
                { label: 'Speaking', value: `${speakingScore}/30`, x: 24, y: 152 },
                { label: 'Writing', value: `${writingScore}/30`, x: 108, y: 152 },
            ];

            scoreCards.forEach((card) => {
                pdf.setFillColor(255, 255, 255);
                pdf.setDrawColor(203, 213, 225);
                pdf.roundedRect(card.x, card.y, 78, 21, 3, 3, 'FD');
                pdf.setTextColor(100, 116, 139);
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(10);
                pdf.text(card.label, card.x + 6, card.y + 8);
                pdf.setTextColor(15, 23, 42);
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(15);
                pdf.text(card.value, card.x + 6, card.y + 16);
            });

            pdf.addImage(qrCodeDataUrl, 'PNG', centerX - 18, 186, 36, 36);
            pdf.setTextColor(71, 85, 105);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            pdf.text('Scan to visit', centerX, 227, { align: 'center' });
            pdf.setTextColor(30, 64, 175);
            pdf.setFontSize(10);
            pdf.text('https://toefl.faintry.com', centerX, 233, { align: 'center' });

            pdf.setTextColor(100, 116, 139);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            pdf.text(
                `Completed on ${new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                })}`,
                centerX,
                246,
                { align: 'center' },
            );

            pdf.setFontSize(8.5);
            pdf.text(
                'This certificate is issued for practice purposes only and does not represent an official TOEFL score.',
                centerX,
                254,
                { align: 'center', maxWidth: 150 },
            );

            pdf.save(`TOEFL_Certificate_${username || 'Student'}_${Date.now()}.pdf`);
        } catch (error) {
            console.error('Failed to generate certificate PDF:', error);
            alert('Unable to generate the certificate PDF right now. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const progressWidth = (score: number, total: number) => {
        return total > 0 ? Math.min((score / total) * 100, 100) : 0;
    };

    const getScoreLevel = (score: number, total: number) => {
        const percentage = total > 0 ? (score / total) * 100 : 0;
        if (percentage >= 90) return { level: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100' };
        if (percentage >= 80) return { level: 'Very Good', color: 'text-blue-600', bgColor: 'bg-blue-100' };
        if (percentage >= 70) return { level: 'Good', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
        if (percentage >= 60) return { level: 'Fair', color: 'text-orange-600', bgColor: 'bg-orange-100' };
        return { level: 'Need Improvement', color: 'text-red-600', bgColor: 'bg-red-100' };
    };

    const getTotalScoreLevel = () => {
        const percentage = (totalScore / maxTotalScore) * 100;
        if (percentage >= 90) return { level: 'Outstanding', color: 'text-green-600', bgColor: 'bg-green-100' };
        if (percentage >= 80) return { level: 'Excellent', color: 'text-blue-600', bgColor: 'bg-blue-100' };
        if (percentage >= 70) return { level: 'Good', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
        if (percentage >= 60) return { level: 'Fair', color: 'text-orange-600', bgColor: 'bg-orange-100' };
        return { level: 'Need Improvement', color: 'text-red-600', bgColor: 'bg-red-100' };
    };

    const sections = [
        {
            name: 'Reading',
            score: readingScore,
            total: 30,
            icon: BookOpen,
            color: 'blue',
            correctCount: readingCorrectCount,
            totalQuestions: readingTotalQuestions,
        },
        {
            name: 'Listening',
            score: listeningScore,
            total: 30,
            icon: TrendingUp,
            color: 'green',
            correctCount: listeningCorrectCount,
            totalQuestions: listeningTotalQuestions,
        },
        { name: 'Speaking', score: speakingScore, total: 30, icon: BarChart3, color: 'purple' },
        { name: 'Writing', score: writingScore, total: 30, icon: Award, color: 'orange' },
    ];

    const overallLevel = getTotalScoreLevel();

    return (
        <>
            <Head title="Test Results - TOEFL Scoreboard">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600">
                            <Award className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="mb-2 text-3xl font-bold text-gray-800">TOEFL Test Results</h1>
                        <p className="text-gray-600">Congratulations on completing your TOEFL practice test!</p>
                    </div>

                    <div className="mx-auto max-w-4xl space-y-6">
                        {/* Overall Score Card */}
                        <Card className="border-0 bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl">
                            <CardHeader className="pb-2 text-center">
                                <CardTitle className="text-xl font-bold">Overall Score</CardTitle>
                                <CardDescription className="text-blue-100">
                                    {username ? `Results for ${username}` : 'Your Test Results'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-center">
                                <div className="mb-2 text-4xl font-bold sm:text-6xl">{totalScore}</div>
                                <div className="mb-4 text-xl">out of {maxTotalScore}</div>
                                <div className={`inline-flex items-center rounded-full border border-white/20 bg-white/20 px-4 py-2`}>
                                    <span className="font-semibold text-white">{overallLevel.level}</span>
                                </div>
                                <div className="mt-4 h-3 rounded-full bg-white/20">
                                    <div
                                        className="h-3 rounded-full bg-white transition-all duration-1000 ease-out"
                                        style={{ width: `${(totalScore / maxTotalScore) * 100}%` }}
                                    ></div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Completion Status */}
                        <Card className="border-l-4 border-l-green-500 bg-green-50">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                                        <Award className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-green-800">Test Completed!</h3>
                                        <p className="text-sm text-green-700">
                                            Your test results are ready. You can download your certificate below.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-blue-500 bg-blue-50">
                            <CardContent className="pt-6">
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-blue-900">Dummy test note</h3>
                                    <p className="text-sm text-blue-800">
                                        The current questions are still dummy content for testing. Use the correct-answer counts below as a quick validation of your practice run.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Section Scores Grid */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {sections.map((section) => {
                                const Icon = section.icon;
                                const level = getScoreLevel(section.score, section.total);
                                const colorMap = {
                                    blue: 'from-blue-500 to-blue-600',
                                    green: 'from-green-500 to-green-600',
                                    purple: 'from-purple-500 to-purple-600',
                                    orange: 'from-orange-500 to-orange-600',
                                };

                                return (
                                    <Card key={section.name} className="border-0 shadow-lg transition-shadow hover:shadow-xl">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <div
                                                    className={`h-10 w-10 bg-gradient-to-r ${colorMap[section.color as keyof typeof colorMap]} flex items-center justify-center rounded-lg`}
                                                >
                                                    <Icon className="h-5 w-5 text-white" />
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-gray-800">{section.score}</div>
                                                    <div className="text-sm text-gray-500">/ {section.total}</div>
                                                </div>
                                            </div>
                                            <CardTitle className="text-lg">{section.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="h-2 rounded-full bg-gray-200">
                                                    <div
                                                        className={`bg-gradient-to-r ${colorMap[section.color as keyof typeof colorMap]} h-2 rounded-full transition-all duration-1000 ease-out`}
                                                        style={{ width: `${progressWidth(section.score, section.total)}%` }}
                                                    ></div>
                                                </div>
                                                <div
                                                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${level.bgColor} ${level.color}`}
                                                >
                                                    {level.level}
                                                </div>
                                                {typeof section.correctCount === 'number' && typeof section.totalQuestions === 'number' && (
                                                    <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
                                                        Correct answers: <span className="font-semibold text-gray-800">{section.correctCount}</span> / {section.totalQuestions}
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Performance Insights */}
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-blue-600" />
                                    Performance Insights
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div>
                                        <h4 className="mb-2 font-semibold text-gray-800">Strengths</h4>
                                        <ul className="space-y-1 text-sm text-gray-600">
                                            {sections
                                                .filter((s) => s.total > 0 && s.score >= s.total * 0.7)
                                                .map((s) => (
                                                    <li key={s.name} className="flex items-center gap-2">
                                                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                                        {s.name} - {s.score} points
                                                    </li>
                                                ))}
                                            {sections.filter((s) => s.total > 0 && s.score >= s.total * 0.7).length === 0 && (
                                                <li className="text-gray-500 italic">Keep practicing to improve your scores!</li>
                                            )}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="mb-2 font-semibold text-gray-800">Areas for Improvement</h4>
                                        <ul className="space-y-1 text-sm text-gray-600">
                                            {sections
                                                .filter((s) => s.total > 0 && s.score < s.total * 0.7)
                                                .map((s) => (
                                                    <li key={s.name} className="flex items-center gap-2">
                                                        <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                                                        {s.name} - Focus on practice
                                                    </li>
                                                ))}
                                            {sections.filter((s) => s.total > 0 && s.score < s.total * 0.7).length === 0 && (
                                                <li className="text-gray-500 italic">Excellent performance across all sections!</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap justify-center gap-4 pt-6">
                            <Button
                                asChild
                                size="lg"
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            >
                                <Link href="/reset-test" method="post">
                                    <Home className="mr-2 h-4 w-4" />
                                    Back to Dashboard
                                </Link>
                            </Button>
                            <Button variant="outline" size="lg" onClick={generateCertificate} disabled={isGenerating}>
                                {isGenerating ? (
                                    <>
                                        <svg className="mr-2 -ml-1 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Download className="mr-2 h-4 w-4" />
                                        Download Certificate
                                    </>
                                )}
                            </Button>
                            <Button asChild variant="outline" size="lg" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                                <Link href="/feedback">
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    View Feedback
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
