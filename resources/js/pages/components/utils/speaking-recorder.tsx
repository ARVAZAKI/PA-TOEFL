import { useRef, useState } from 'react';

export default function SpeakingRecorder({ onSave }: { onSave: (audioBlob: Blob) => void }) {
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            setRecordingTime(0);

            mediaRecorder.ondataavailable = (e) => {
                audioChunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                if (intervalRef.current) clearInterval(intervalRef.current);

                const audioBlob = new Blob(audioChunksRef.current, {
                    type: 'audio/webm;codecs=opus',
                });

                // Jika blob terlalu kecil (misal rekaman < 300ms)
                if (audioBlob.size < 1000) {
                    alert('Rekaman terlalu singkat. Silakan coba lagi.');
                    setAudioUrl(null);
                    return;
                }

                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url);
                onSave(audioBlob);
            };

            mediaRecorder.start();
            setIsRecording(true);

            // Timer durasi rekaman (opsional)
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
        console.log(audioUrl);
    };

    // Bersihkan audioUrl saat unmount (opsional)
    // useEffect(() => {
    //     return () => {
    //         if (audioUrl) URL.revokeObjectURL(audioUrl);
    //     };
    // }, [audioUrl]);

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`rounded px-4 py-2 font-semibold text-white ${isRecording ? 'bg-red-600' : 'bg-green-600'}`}
                >
                    {isRecording ? 'Stop' : 'Record'}
                </button>

                {isRecording && <span className="text-sm text-gray-600">Durasi: {recordingTime}s</span>}
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
