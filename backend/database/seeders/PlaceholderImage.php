<?php

namespace Database\Seeders;

/**
 * Generates clean, premium-looking SVG placeholder product images.
 * These live in storage/app/public/products and can be replaced by the
 * admin with real photography at any time (uploads use the same flow).
 */
class PlaceholderImage
{
    /**
     * Minimal line-art per product family, drawn on a 1200x1200 canvas.
     */
    private const ART = [
        'headphones' => [
            '<path d="M 370 590 a 230 230 0 0 1 460 0" fill="none" stroke="#1c1917" stroke-width="28" stroke-linecap="round"/>',
            '<rect x="315" y="580" width="130" height="200" rx="58" fill="#1c1917"/>',
            '<rect x="755" y="580" width="130" height="200" rx="58" fill="#1c1917"/>',
            '<circle cx="380" cy="680" r="36" fill="#b08d57" opacity="0.85"/>',
            '<circle cx="820" cy="680" r="36" fill="#b08d57" opacity="0.85"/>',
        ],
        'earbuds' => [
            '<path d="M 465 415 a 92 92 0 1 1 -2 0 Z M 450 505 q -12 155 24 268 q 9 30 40 25 l 22 -3 q 32 -5 25 -37 q -32 -145 -23 -253" fill="#1c1917" fill-rule="evenodd"/>',
            '<path d="M 735 415 a 92 92 0 1 0 2 0 Z M 750 505 q 12 155 -24 268 q -9 30 -40 25 l -22 -3 q -32 -5 -25 -37 q 32 -145 23 -253" fill="#b08d57" fill-rule="evenodd" opacity="0.92"/>',
        ],
        'watch' => [
            '<path d="M 520 330 q 80 -28 160 0 l -14 110 h -132 z" fill="#1c1917"/>',
            '<path d="M 520 870 q 80 28 160 0 l -14 -110 h -132 z" fill="#1c1917"/>',
            '<rect x="420" y="430" width="360" height="360" rx="96" fill="#1c1917"/>',
            '<rect x="452" y="462" width="296" height="296" rx="72" fill="#faf8f5"/>',
            '<path d="M 600 545 v 82 l 56 34" fill="none" stroke="#1c1917" stroke-width="18" stroke-linecap="round"/>',
            '<circle cx="600" cy="610" r="13" fill="#b08d57"/>',
        ],
        'speaker' => [
            '<rect x="395" y="320" width="410" height="580" rx="74" fill="#1c1917"/>',
            '<circle cx="600" cy="500" r="98" fill="none" stroke="#faf8f5" stroke-width="16"/>',
            '<circle cx="600" cy="500" r="44" fill="#b08d57" opacity="0.9"/>',
            '<circle cx="600" cy="730" r="72" fill="none" stroke="#faf8f5" stroke-width="14" opacity="0.75"/>',
            '<circle cx="600" cy="730" r="27" fill="#faf8f5" opacity="0.75"/>',
        ],
        'soundbar' => [
            '<rect x="240" y="515" width="720" height="175" rx="86" fill="#1c1917"/>',
            '<circle cx="365" cy="602" r="47" fill="none" stroke="#faf8f5" stroke-width="12"/>',
            '<circle cx="600" cy="602" r="47" fill="none" stroke="#faf8f5" stroke-width="12"/>',
            '<circle cx="835" cy="602" r="47" fill="none" stroke="#faf8f5" stroke-width="12"/>',
            '<circle cx="482" cy="602" r="15" fill="#b08d57"/>',
            '<circle cx="718" cy="602" r="15" fill="#b08d57"/>',
        ],
        'camera' => [
            '<path d="M 480 430 h 90 l 30 42 h 190 a 55 55 0 0 1 55 55 v 210 a 55 55 0 0 1 -55 55 h -420 a 55 55 0 0 1 -55 -55 v -210 a 55 55 0 0 1 55 -55 h 105 z" fill="#1c1917"/>',
            '<circle cx="600" cy="650" r="110" fill="#faf8f5"/>',
            '<circle cx="600" cy="650" r="72" fill="none" stroke="#1c1917" stroke-width="22"/>',
            '<circle cx="600" cy="650" r="24" fill="#b08d57"/>',
            '<rect x="700" y="486" width="90" height="26" rx="13" fill="#b08d57" opacity="0.85"/>',
        ],
        'keyboard' => [
            '<rect x="250" y="450" width="700" height="320" rx="52" fill="#1c1917"/>',
        ],
        'charger' => [
            '<rect x="380" y="380" width="440" height="440" rx="80" fill="#1c1917"/>',
            '<path d="M 640 470 l -130 170 h 90 l -40 150 l 140 -185 h -90 z" fill="#b08d57"/>',
        ],
    ];

    private const KEYS = [
        ['x' => 310, 'y' => 505], ['x' => 392, 'y' => 505], ['x' => 474, 'y' => 505], ['x' => 556, 'y' => 505],
        ['x' => 638, 'y' => 505], ['x' => 720, 'y' => 505], ['x' => 802, 'y' => 505],
        ['x' => 310, 'y' => 585], ['x' => 392, 'y' => 585], ['x' => 474, 'y' => 585], ['x' => 556, 'y' => 585],
        ['x' => 638, 'y' => 585], ['x' => 720, 'y' => 585], ['x' => 802, 'y' => 585],
        ['x' => 351, 'y' => 665], ['x' => 433, 'y' => 665], ['x' => 515, 'y' => 665], ['x' => 597, 'y' => 665],
        ['x' => 679, 'y' => 665], ['x' => 761, 'y' => 665],
    ];

    public static function make(string $artKey, string $label, int $variant = 0): string
    {
        $art = self::ART[$artKey] ?? self::ART['headphones'];

        if ($artKey === 'keyboard') {
            $keys = '';
            foreach (self::KEYS as $i => $k) {
                $fill = ($i % 7 === 3) ? '#b08d57' : '#faf8f5';
                $keys .= sprintf(
                    '<rect x="%d" y="%d" width="64" height="56" rx="14" fill="%s" opacity="0.92"/>',
                    $k['x'], $k['y'], $fill,
                );
            }
            $art[] = '<g>' . $keys . '</g>';
        }

        // Slight rotation per gallery variant so thumbnails feel distinct
        // while staying part of the same visual system.
        $rotation = [0, -4, 4, -2][$variant % 4];
        $angle1 = [35, 145, 215, 305][$variant % 4];

        $elements = implode("\n    ", $art);

        return <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200" width="1200" height="1200">
  <defs>
    <linearGradient id="bg{$variant}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f8f5f0"/>
      <stop offset="100%" stop-color="#eae3d7"/>
    </linearGradient>
    <radialGradient id="glow{$variant}" cx="50%" cy="45%" r="58%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="ring{$variant}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#b08d57" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#b08d57" stop-opacity="0.06"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="1200" fill="url(#bg{$variant})"/>
  <circle cx="600" cy="590" r="400" fill="url(#glow{$variant})"/>
  <g transform="rotate({$angle1} 600 600)">
    <circle cx="600" cy="600" r="430" fill="none" stroke="url(#ring{$variant})" stroke-width="3"/>
  </g>
  <circle cx="600" cy="600" r="360" fill="none" stroke="#1c1917" stroke-opacity="0.07" stroke-width="2"/>
  <g transform="rotate({$rotation} 600 600)">
    {$elements}
  </g>
  <text x="96" y="1112" font-family="'Helvetica Neue', Arial, sans-serif" font-size="34"
        letter-spacing="14" fill="#1c1917" fill-opacity="0.45">{$label}</text>
</svg>
SVG;
    }
}
