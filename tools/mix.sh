#!/usr/bin/env bash
# Mezcla final: locución + música (con ducking bajo la voz) + efectos → audio/mix.wav (−14 LUFS)
set -euo pipefail
cd "$(dirname "$0")/.."
ffmpeg -loglevel error -y -i assets/narracion.mp3 -i audio/music.wav -i audio/sfx.wav -filter_complex "
[0:a]aresample=48000,pan=stereo|c0=c0|c1=c0,highpass=f=70,acompressor=threshold=-20dB:ratio=3:attack=5:release=120,apad=whole_dur=118.5,asplit=2[voice][key];
[1:a]volume=0.26[mus];
[mus][key]sidechaincompress=threshold=0.03:ratio=5:attack=40:release=450:makeup=1[musd];
[2:a]volume=0.55[fx];
[voice][musd][fx]amix=inputs=3:normalize=0:duration=first,alimiter=limit=0.95,loudnorm=I=-14:TP=-1.0:LRA=11[out]" \
 -map "[out]" -ar 48000 -t 118.5 audio/mix.wav
echo "mezcla lista: audio/mix.wav"
