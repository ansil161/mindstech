# Video masters

`hero-video-original.mp4` is the 40.7 MB / 1920×1080 / 9.6 Mbps master for the
homepage hero. It lives here rather than in `public/` because **everything in
`public/` is copied verbatim into `dist/` and shipped** — the master sitting
there would have added 40 MB to every deploy while never being requested by a
browser.

Web encodes in `public/assets/videos/` are generated from it. To regenerate
(requires ffmpeg):

    # desktop 1600x900
    ffmpeg -y -i media-src/hero-video-original.mp4 -an -vf scale=1600:-2 -r 25 \
      -c:v libvpx-vp9 -b:v 0 -crf 42 -g 125 -row-mt 1 -tile-columns 2 \
      -cpu-used 3 -pix_fmt yuv420p public/assets/videos/hero-video.webm

    ffmpeg -y -i media-src/hero-video-original.mp4 -an -vf scale=1600:-2 -r 25 \
      -c:v libx264 -crf 30 -preset slow -pix_fmt yuv420p -g 125 \
      -movflags +faststart public/assets/videos/hero-video.mp4

    # mobile 960x540 (served below 700px)
    ffmpeg -y -i media-src/hero-video-original.mp4 -an -vf scale=960:-2 -r 25 \
      -c:v libvpx-vp9 -b:v 0 -crf 44 -g 125 -row-mt 1 -cpu-used 3 \
      -pix_fmt yuv420p public/assets/videos/hero-video-mobile.webm

    ffmpeg -y -i media-src/hero-video-original.mp4 -an -vf scale=960:-2 -r 25 \
      -c:v libx264 -crf 32 -preset slow -pix_fmt yuv420p -g 125 \
      -movflags +faststart public/assets/videos/hero-video-mobile.mp4

    # poster
    ffmpeg -y -ss 1.5 -i media-src/hero-video-original.mp4 -frames:v 1 -q:v 4 \
      public/assets/videos/hero-poster.jpg

`-an` is deliberate: the hero plays muted, and browsers refuse to autoplay
anything unmuted, so the audio track is pure dead weight.
