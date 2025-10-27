import { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  FileText, 
  Download,
  CheckCircle2,
  PlayCircle,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

export default function LecturePage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'en' | 'ar' | 'he';
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);

  const lectureId = parseInt(id || '0');
  
  const { data, isLoading, error } = trpc.lectures.get.useQuery(
    { id: lectureId },
    { enabled: !!lectureId }
  );

  const updateProgressMutation = trpc.progress.update.useMutation({
    onSuccess: () => {
      // Progress updated silently
    },
    onError: (error) => {
      console.error('Failed to update progress:', error);
    }
  });

  // Update progress every 10 seconds while playing
  useEffect(() => {
    if (!isPlaying || !data?.lecture) return;

    const interval = setInterval(() => {
      if (videoRef.current && data.lecture) {
        const progressPercent = (videoRef.current.currentTime / videoRef.current.duration) * 100;
        
        updateProgressMutation.mutate({
          lectureId: data.lecture.id,
          positionSec: Math.floor(videoRef.current.currentTime),
          completed: progressPercent >= 95,
          watchedLanguage: lang,
        });
      }
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [isPlaying, data?.lecture]);

  // Video event handlers
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="aspect-video bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">{t('common.error')}</p>
            <Button onClick={() => navigate('/student')} className="mt-4">
              {t('common.back')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { lecture, attachments } = data;
  
  const title = lang === 'ar' ? (lecture.titleAr || lecture.title) :
                lang === 'he' ? (lecture.titleHe || lecture.title) :
                lecture.title;
  
  const description = lang === 'ar' ? (lecture.descriptionAr || lecture.description) :
                      lang === 'he' ? (lecture.descriptionHe || lecture.description) :
                      lecture.description;
  
  const summary = lang === 'ar' ? (lecture.summaryMarkdownAr || lecture.summaryMarkdown) :
                  lang === 'he' ? (lecture.summaryMarkdownHe || lecture.summaryMarkdown) :
                  lecture.summaryMarkdown;
  
  const videoUrl = lang === 'ar' ? (lecture.videoUrlAr || lecture.videoUrl) :
                   lang === 'he' ? (lecture.videoUrlHe || lecture.videoUrl) :
                   lecture.videoUrl;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('common.back')}
            </Button>
            <Badge variant="outline">
              {Math.floor(progress)}% {t('progress.complete')}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <Card>
              <CardContent className="p-0">
                <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    src={videoUrl || ''}
                    className="w-full h-full"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={() => {
                      setIsPlaying(false);
                      // Mark as complete
                      if (videoRef.current) {
                        updateProgressMutation.mutate({
                          lectureId: lecture.id,
                          positionSec: Math.floor(videoRef.current.duration),
                          completed: true,
                          watchedLanguage: lang,
                        });
                      }
                      toast.success(t('lectures.completed'));
                    }}
                  />
                  
                  {/* Custom Controls */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Controls */}
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handlePlayPause}
                          className="text-white hover:bg-white/20"
                        >
                          {isPlaying ? (
                            <Pause className="h-5 w-5" />
                          ) : (
                            <PlayCircle className="h-5 w-5" />
                          )}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleMuteToggle}
                          className="text-white hover:bg-white/20"
                        >
                          {isMuted ? (
                            <VolumeX className="h-5 w-5" />
                          ) : (
                            <Volume2 className="h-5 w-5" />
                          )}
                        </Button>
                        
                        <span className="text-sm">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white hover:bg-white/20"
                        >
                          <Settings className="h-5 w-5" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleFullscreen}
                          className="text-white hover:bg-white/20"
                        >
                          <Maximize className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lecture Info */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{title}</h1>
              {description && (
                <p className="text-muted-foreground">{description}</p>
              )}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="summary">
              <TabsList>
                <TabsTrigger value="summary">{t('lectures.summary')}</TabsTrigger>
                <TabsTrigger value="attachments">
                  {t('lectures.attachments')} ({attachments.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary" className="space-y-4">
                {summary ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="prose dark:prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap font-sans">
                          {summary}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      {t('lectures.noSummary')}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="attachments" className="space-y-4">
                {attachments.length > 0 ? (
                  <div className="grid gap-4">
                    {attachments.map((attachment) => {
                      const attTitle = lang === 'ar' ? (attachment.titleAr || attachment.title) :
                                      lang === 'he' ? (attachment.titleHe || attachment.title) :
                                      attachment.title;
                      
                      return (
                        <Card key={attachment.id}>
                          <CardContent className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{attTitle}</p>
                                <p className="text-sm text-muted-foreground">
                                  {attachment.fileType?.toUpperCase()}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <a href={attachment.fileUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 mr-2" />
                                {t('common.download')}
                              </a>
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      {t('lectures.noAttachments')}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('lectures.details')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t('lectures.duration')}</p>
                  <p className="font-medium">{Math.floor(lecture.durationSec / 60)} {t('common.minutes')}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">{t('progress.yourProgress')}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{Math.floor(progress)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

