
(function () {
    'use strict';

    const BEIGE          = '#e6d9c3';
    const PLANE_SIZE     = 88;
    const ANGLE_OFFSET   = 0;

    const FLIGHT_MS      = 2800;      // длительность полёта
    const DELAY_MS       = 350;       // пауза перед взлётом
    const EXIT_MS        = 600;       // время раскрутки самолётика
    const CURTAIN_MS     = 1100;
    const SLIT_MAX       = 160;
    let W, H;
    const PATH_EDGE_PAD = 40;

    const getCtrl = () => {
        const e = PATH_EDGE_PAD;
        const P0 = { x: -e, y: H + e };
        const P3 = { x: W + e, y: -e };
        const t = 1 / 3;
        const P1 = { x: P0.x + (P3.x - P0.x) * t, y: P0.y + (P3.y - P0.y) * t };
        const P2 = { x: P0.x + (P3.x - P0.x) * (2 * t), y: P0.y + (P3.y - P0.y) * (2 * t) };
        return { P0, P1, P2, P3 };
    };

    let ctrl;

    const bPt = (t) => {
        const { P0, P1, P2, P3 } = ctrl, u = 1 - t;
        return {
            x: u*u*u*P0.x + 3*u*u*t*P1.x + 3*u*t*t*P2.x + t*t*t*P3.x,
            y: u*u*u*P0.y + 3*u*u*t*P1.y + 3*u*t*t*P2.y + t*t*t*P3.y,
        };
    };

    const bAngle = (t) => {
        const { P0, P1, P2, P3 } = ctrl, u = 1 - t;
        const dx = 3*(u*u*(P1.x-P0.x)+2*u*t*(P2.x-P1.x)+t*t*(P3.x-P2.x));
        const dy = 3*(u*u*(P1.y-P0.y)+2*u*t*(P2.y-P1.y)+t*t*(P3.y-P2.y));
        return Math.atan2(dy, dx) * 180 / Math.PI + ANGLE_OFFSET;
    };

    const split = (u) => {
        const { P0, P1, P2, P3 } = ctrl;
        const lerp = (a, b) => ({ x: a.x+(b.x-a.x)*u, y: a.y+(b.y-a.y)*u });
        const A=lerp(P0,P1), B=lerp(P1,P2), C=lerp(P2,P3);
        const D=lerp(A,B),   E=lerp(B,C);
        const F=lerp(D,E);
        return { Q0:P0, Q1:A, Q2:D, Q3:F };
    };


    const buildSVGPath = () => {
        const { P0, P1, P2, P3 } = ctrl;
        return `M${P0.x},${P0.y} C${P1.x},${P1.y} ${P2.x},${P2.y} ${P3.x},${P3.y}`;
    };

    let particles = [];

    const spawnParticles = (x, y, count = 3) => {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.4 + Math.random() * 1.2;
            particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 0.6,
                life: 1,
                decay: 0.018 + Math.random() * 0.022,
                size: 1.5 + Math.random() * 3,
                hue: 40 + Math.random() * 20,
            });
        }
    };

    const updateParticles = (ctx) => {
        particles = particles.filter(p => p.life > 0);
        particles.forEach(p => {
            p.x  += p.vx;
            p.y  += p.vy;
            p.vy += 0.04;
            p.life -= p.decay;

            const a = Math.max(0, p.life);
            ctx.beginPath();

            for (let i = 0; i < 8; i++) {
                const r  = i % 2 === 0 ? p.size : p.size * 0.4;
                const th = (i / 8) * Math.PI * 2;
                const px = p.x + Math.cos(th) * r;
                const py = p.y + Math.sin(th) * r;
                if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fillStyle = `hsla(${p.hue}, 90%, 68%, ${a})`;
            ctx.fill();
        });
    };

    const drawCanvas = (ctx, progress) => {
        ctx.clearRect(0, 0, W, H);
        if (progress <= 0) {
            ctx.globalAlpha = 1;
            ctx.fillStyle = BEIGE;
            ctx.fillRect(0, 0, W, H);
            return;
        }

        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = BEIGE;
        ctx.fillRect(0, 0, W, H);
        const p = Math.min(Math.max(progress, 0), 1);
        const slitW = p < 1 ? SLIT_MAX * p * p : SLIT_MAX;
        const { Q0, Q1, Q2, Q3 } = split(p);

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.moveTo(Q0.x, Q0.y);
        ctx.bezierCurveTo(Q1.x, Q1.y, Q2.x, Q2.y, Q3.x, Q3.y);
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth = slitW;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        ctx.globalCompositeOperation = 'source-over';
        updateParticles(ctx);
    };

    const init = () => {
        const wrap       = document.getElementById('preloader');
        const canvas     = document.getElementById('pl-canvas');
        const pathSvg    = document.getElementById('pl-path-svg');
        const pathEl     = document.getElementById('pl-path');
        const planeWrap  = document.getElementById('pl-plane-wrap');
        const planeTilt  = document.getElementById('pl-plane-tilt');
        const plane      = document.getElementById('pl-plane');
        const curtainTop = document.getElementById('curtain-top');
        const curtainBottom = document.getElementById('curtain-bottom');
        if (!wrap || !canvas || !planeWrap || !planeTilt || !plane || !pathEl) return;

        const ctx = canvas.getContext('2d');
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;

        ctrl = getCtrl();
        if (pathSvg && pathEl) {
            pathSvg.setAttribute('viewBox', `0 0 ${W} ${H}`);
            pathSvg.setAttribute('width', String(W));
            pathSvg.setAttribute('height', String(H));
            pathEl.setAttribute('d', buildSVGPath());
        }

        document.body.classList.add('is-loading');

        drawCanvas(ctx, 0);

        let progress  = 0;
        let rafId     = null;
        let startTime = null;
        let running   = false;

        let lastPlaneX = bPt(0).x;
        let lastPlaneY = bPt(0).y;

        const canvasLoop = (now) => {
            if (!startTime) startTime = now;
            const elapsed = now - startTime;
            progress = Math.min(elapsed / FLIGHT_MS, 1);

            const p = bPt(progress);
            if (running && progress < 0.98) {
                const dist = Math.hypot(p.x - lastPlaneX, p.y - lastPlaneY);
                if (dist > 8) {
                    spawnParticles(p.x, p.y, 2);
                    lastPlaneX = p.x;
                    lastPlaneY = p.y;
                }
            }

            drawCanvas(ctx, progress);

            if (progress < 1 || particles.length > 0) {
                rafId = requestAnimationFrame(canvasLoop);
            }
        };

        const anPath = anime.path('#pl-path');

        let preloaderFinished = false;

        const finishPreloader = () => {
            if (preloaderFinished) return;
            preloaderFinished = true;

            cancelAnimationFrame(rafId);
            canvas.style.visibility = 'hidden';
            canvas.style.opacity = '0';

            const vh = window.innerHeight;
            const end = () => {
                document.body.classList.remove('is-loading');
                wrap.style.pointerEvents = 'none';
                wrap.style.opacity = '0';
                setTimeout(() => wrap.remove(), 80);
            };

            if (curtainTop && curtainBottom && typeof gsap !== 'undefined') {
                curtainTop.style.visibility = 'visible';
                curtainTop.style.opacity = '1';
                curtainBottom.style.visibility = 'visible';
                curtainBottom.style.opacity = '1';

                gsap.set([curtainTop, curtainBottom], { y: 0 });

                gsap
                    .timeline({ onComplete: end })
                    .to(
                        curtainTop,
                        {
                            y: -vh,
                            duration: CURTAIN_MS / 1000,
                            ease: 'power3.inOut',
                        },
                        0
                    )
                    .to(
                        curtainBottom,
                        {
                            y: vh,
                            duration: CURTAIN_MS / 1000,
                            ease: 'power3.inOut',
                        },
                        0
                    );
                return;
            }

            end();
        };

        const tl = anime.timeline({ autoplay: false });

        tl.add({
            targets: plane,
            opacity: [0, 1],
            scale:   [0.4, 1],
            duration: 400,
            easing: 'easeOutBack',
        });

        tl.add({
            targets: planeWrap,
            translateX: anPath('x'),
            translateY: anPath('y'),
            duration:   FLIGHT_MS,
            easing:     'linear',
            begin: () => {
                running = true;
                startTime = null;
                rafId = requestAnimationFrame(canvasLoop);
            },
        });

        tl.add({
            targets: planeTilt,
            rotate:   anPath('angle'),
            duration: FLIGHT_MS,
            easing:   'linear',
        }, `-=${FLIGHT_MS}`);

        tl.add({
            targets: planeWrap,
            translateX: `+=${W * 0.15}`,
            translateY: `-=${H * 0.18}`,
            duration:   EXIT_MS,
            easing:     'easeInCubic',
        });

        tl.add({
            targets: plane,
            rotate:  `+=${300}`,
            scale:   0.2,
            opacity: 0,
            duration: EXIT_MS,
            easing:   'easeInCubic',
            complete: () => {
                requestAnimationFrame(finishPreloader);
            },
        }, `-=${EXIT_MS}`);

        setTimeout(() => tl.play(), DELAY_MS);
    };

    document.addEventListener('DOMContentLoaded', init);
})();
