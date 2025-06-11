import { useRef, useState } from 'react';

export default function SpeakingRecorder({ onSave }: { onSave: (audioBlob: Blob) => void }) {
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [transcript, setTranscript] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus',
            });
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            setRecordingTime(0);
            setTranscript(null);
            setAudioUrl(null);

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                    console.log('Data tersedia:', e.data.size, 'bytes');
                }
            };

            mediaRecorder.onstop = () => {
                if (intervalRef.current) clearInterval(intervalRef.current);

                const audioBlob = new Blob(audioChunksRef.current, {
                    type: 'audio/webm;codecs=opus',
                });

                console.log('Blob final size:', audioBlob.size);

                if (audioBlob.size < 1000) {
                    alert('Rekaman terlalu singkat atau kosong. Silakan coba lagi.');
                    return;
                }

                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url);
                onSave(audioBlob);
            };

            mediaRecorder.start();
            setIsRecording(true);

            intervalRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        } catch (error) {
            console.error('Gagal mengakses mikrofon:', error);
            alert('Tidak dapat mengakses mikrofon. Pastikan izin telah diberikan.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    return (
        <div className="w-full place-items-center space-y-4">
            <div className="flex items-center gap-2">
                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`rounded px-4 py-2 font-semibold text-white ${isRecording ? 'bg-red-600' : 'bg-green-600'}`}
                >
                    {isRecording ? 'Stop' : 'Record'}
                </button>

                {isRecording && <span className="text-sm text-gray-600">Duration : {recordingTime}s</span>}
            </div>

            {audioUrl && (
                <audio controls className="w-full">
                    <source src={audioUrl} type="audio/webm;codecs=opus" />
                    Browser tidak mendukung pemutar audio.
                </audio>
            )}
        </div>
    );
}
