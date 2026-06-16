import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { useVideoPlayer, VideoView } from "expo-video";

function youtubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/
  );
  return m ? m[1] : null;
}

function hlsUrl(streamVideoId: string): string {
  const base =
    process.env.EXPO_PUBLIC_STREAM_BASE ??
    "https://customer-stream.cloudflarestream.com";
  return `${base}/${streamVideoId}/manifest/video.m3u8`;
}

interface Props {
  streamVideoId?: string | null;
  youtubeUrl?: string | null;
}

export function VideoPlayer({ streamVideoId, youtubeUrl }: Props) {
  const [playing, setPlaying] = useState(false);

  // expo-video player is always created (hooks can't be conditional); we only
  // mount the VideoView when there is an HLS source and the user pressed play.
  const source = streamVideoId ? hlsUrl(streamVideoId) : null;
  const player = useVideoPlayer(source, (p) => {
    p.loop = false;
  });

  if (!streamVideoId && !youtubeUrl) return null;

  if (!playing) {
    return (
      <Pressable
        onPress={() => {
          setPlaying(true);
          if (source) player.play();
        }}
        className="mt-3 h-52 items-center justify-center rounded-2xl bg-slate-900"
      >
        <View className="h-16 w-16 items-center justify-center rounded-full bg-white/90">
          <Text className="ml-1 text-2xl">▶️</Text>
        </View>
        <Text className="mt-2 text-xs font-medium text-white/80">Watch it go off</Text>
      </Pressable>
    );
  }

  if (streamVideoId && source) {
    return (
      <VideoView
        player={player}
        className="mt-3 h-52 w-full rounded-2xl"
        contentFit="cover"
      />
    );
  }

  const id = youtubeUrl ? youtubeId(youtubeUrl) : null;
  if (id) {
    return (
      <View className="mt-3 h-52 w-full overflow-hidden rounded-2xl">
        <WebView
          source={{ uri: `https://www.youtube.com/embed/${id}?autoplay=1` }}
          allowsInlineMediaPlayback
          javaScriptEnabled
        />
      </View>
    );
  }

  return null;
}
