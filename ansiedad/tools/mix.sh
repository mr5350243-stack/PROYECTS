#!/usr/bin/env bash
# Mezcla: locución (sin modificar) + música con ducking bajo la voz + efectos → ansiedad/audio/mix.wav (−14 LUFS)
set -euo pipefail
cd "$(dirname "$0")/.."
DUR=100.6
ffmpeg -loglevel error -y -i assets/narracion.mp3 -i audio/music.wav -i audio/sfx.wav -filter_complex "
[0:a]aresample=48000,pan=stereo|c0=c0|c1=c0,highpass=f=70,acompressor=threshold=-20dB:ratio=3:attack=5:release=120,apad=whole_dur=$DUR,asplit=2[voice][key];
[1:a]volume=0.24[mus];
[mus][key]sidechaincompress=threshold=0.03:ratio=5:attack=40:release=450:makeup=1[musd];
[2:a]volume=0.6[fx];
[voice][musd][fx]amix=inputs=3:normalize=0:duration=first,afade=t=out:st=$(echo "$DUR-1.6" | bc):d=1.6,alimiter=limit=0.95,loudnorm=I=-14:TP=-1.0:LRA=11[out]" \
 -map "[out]" -ar 48000 -t $DUR audio/mix.wav
echo "mezcla lista: ansiedad/audio/mix.wav"
