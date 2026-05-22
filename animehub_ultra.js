(function () {

    // LampaS Plugin Registration
    if (typeof Lampa === 'undefined') return;

    Lampa.Plugin.register('animehub_ultra', function (Lampa) {

        const API = 'https://shikimori.one/api/animes';

        // ===== STORAGE =====
        let fav = JSON.parse(localStorage.getItem('ah_fav') || '[]');
        let history = JSON.parse(localStorage.getItem('ah_history') || '[]');
        let progress = JSON.parse(localStorage.getItem('ah_progress') || '{}');

        function save() {
            localStorage.setItem('ah_fav', JSON.stringify(fav));
            localStorage.setItem('ah_history', JSON.stringify(history));
            localStorage.setItem('ah_progress', JSON.stringify(progress));
        }

        // ===== API =====
        function api(query = '') {
            return fetch(API + '?limit=20' + query)
                .then(r => r.json())
                .catch(e => {
                    console.error('AnimeHub API error:', e);
                    return [];
                });
        }

        // ===== NETFLIX HOME =====
        function openHome() {

            Promise.all([
                api(),
                api('&order=popularity'),
                api('&order=ranked')
            ]).then(([latest, popular, top]) => {

                let items = [];

                // Continue Watching
                const continueWatching = buildContinue();
                if (continueWatching.length > 0) {
                    items.push({
                        title: 'Continue Watching',
                        items: continueWatching
                    });
                }

                items.push(
                    {
                        title: '🔥 Latest',
                        items: cards(latest)
                    },
                    {
                        title: '⭐ Popular',
                        items: cards(popular)
                    },
                    {
                        title: '🏆 Top Rated',
                        items: cards(top)
                    },
                    {
                        title: '❤️ Favorites',
                        items: cards(fav)
                    }
                );

                Lampa.Activity.push({
                    title: 'AnimeHub ULTRA',
                    component: 'category',
                    page: 1,
                    source: items
                });

            }).catch(e => {
                Lampa.Noty.show('Failed to load AnimeHub');
                console.error('AnimeHub error:', e);
            });

        }

        // ===== CARDS =====
        function cards(data) {
            if (!Array.isArray(data)) return [];
            
            return data.map(a => ({
                title: a.russian || a.name,
                subtitle: `${a.score || '?'} ★ • ${a.kind}`,
                image: a.image?.preview || '',
                data: a,
                action: function() {
                    openAnime(a);
                }
            }));
        }

        // ===== CONTINUE WATCHING =====
        function buildContinue() {

            return Object.keys(progress).slice(0, 10).map(id => {

                const a = progress[id];

                return {
                    title: a.title,
                    subtitle: `Episode ${a.ep || 1}`,
                    image: a.image || '',
                    data: a,
                    action: function() {
                        const ep = (progress[a.id]?.ep || 1) + 1;
                        play(a, ep);
                    }
                };

            });

        }

        // ===== ANIME PAGE =====
        function openAnime(anime) {

            let isFav = fav.find(x => x.id === anime.id);
            let prog = progress[anime.id];

            if (!history.includes(anime.id)) {
                history.push(anime.id);
            }
            save();

            const html = `
                <div style="padding:20px;color:#fff;font-family:Arial,sans-serif">
                    <h2 style="margin:0 0 20px 0">${anime.russian || anime.name}</h2>
                    <img src="${anime.image?.original || ''}" style="width:100%;max-width:300px;border-radius:12px;margin-bottom:20px"/>
                    <p style="margin:0 0 15px 0;line-height:1.6;color:#ccc">${anime.description || 'No description'}</p>
                    <div style="margin:20px 0;font-size:14px;color:#aaa">
                        <div style="margin:5px 0"><b>Rating:</b> ${anime.score || 'N/A'} ⭐</div>
                        <div style="margin:5px 0"><b>Episodes:</b> ${anime.episodes || '?'}</div>
                        <div style="margin:5px 0"><b>Type:</b> ${anime.kind || 'Unknown'}</div>
                    </div>
                    <div style="display:flex;gap:10px;margin-top:30px;flex-wrap:wrap">
                        <button id="play" style="padding:10px 20px;background:#e50914;color:#fff;border:none;border-radius:5px;cursor:pointer;font-size:14px;font-weight:bold">▶ Play</button>
                        <button id="next" style="padding:10px 20px;background:#221f1f;color:#fff;border:1px solid #555;border-radius:5px;cursor:pointer;font-size:14px;font-weight:bold">⏭ Next Episode</button>
                        <button id="fav" style="padding:10px 20px;background:#221f1f;color:#fff;border:1px solid #555;border-radius:5px;cursor:pointer;font-size:14px;font-weight:bold">${isFav ? '💔 Remove' : '❤️ Favorite'}</button>
                    </div>
                </div>
            `;

            Lampa.Activity.push({
                title: anime.russian || anime.name,
                component: 'full',
                html: html
            });

            setTimeout(() => {

                const playBtn = document.getElementById('play');
                const nextBtn = document.getElementById('next');
                const favBtn = document.getElementById('fav');

                if (playBtn) {
                    playBtn.onclick = () => play(anime, 1);
                }

                if (nextBtn) {
                    nextBtn.onclick = () => {
                        let ep = (prog?.ep || 1) + 1;
                        play(anime, ep);
                    };
                }

                if (favBtn) {
                    favBtn.onclick = () => {

                        if (isFav) {
                            fav = fav.filter(x => x.id !== anime.id);
                            isFav = false;
                        } else {
                            fav.push(anime);
                            isFav = true;
                        }

                        save();
                        Lampa.Noty.show('Updated favorites');
                        openAnime(anime);
                    };
                }

            }, 200);

        }

        // ===== PLAY SYSTEM =====
        function play(anime, episode = 1) {

            // save progress
            progress[anime.id] = {
                id: anime.id,
                title: anime.russian || anime.name,
                image: anime.image?.preview || '',
                ep: episode
            };

            save();

            // send to Lampa player
            Lampa.Player.play({
                title: `${anime.russian || anime.name} Episode ${episode}`,
                query: `${anime.russian || anime.name} ${episode}`,
                source: 'animehub_ultra'
            });

            Lampa.Noty.show(`Loading episode ${episode}`);

        }

        // ===== SEARCH =====
        function search() {

            Lampa.Input.edit({
                title: 'AnimeHub ULTRA search',
                free: true
            }, function (v) {

                api('&search=' + encodeURIComponent(v))
                    .then(data => {

                        Lampa.Activity.push({
                            title: 'Search results',
                            component: 'category',
                            page: 1,
                            source: cards(data)
                        });

                    });

            });

        }

        // ===== LAMPA-S CATALOG REGISTRATION =====
        function initCatalog() {

            // LampaS method для регистрации в левом меню
            if (Lampa.Settings && Lampa.Settings.addShortcut) {
                Lampa.Settings.addShortcut({
                    name: 'animehub_ultra',
                    title: '🎬 AnimeHub ULTRA',
                    description: 'Netflix-style anime streaming',
                    icon: '🎬',
                    action: function() {
                        openHome();
                    }
                });
            }

            // Alternative для более старых версий
            if (Lampa.MainPage && typeof Lampa.MainPage.add === 'function') {
                Lampa.MainPage.add({
                    name: 'animehub_ultra',
                    title: '🎬 AnimeHub ULTRA',
                    icon: '🎬',
                    component: function() {
                        openHome();
                    }
                });
            }

        }

        // ===== INIT =====
        try {
            initCatalog();
            Lampa.Noty.show('✓ AnimeHub ULTRA loaded');
            console.log('AnimeHub ULTRA: Plugin initialized successfully');
        } catch (e) {
            console.error('AnimeHub ULTRA error:', e);
            Lampa.Noty.show('AnimeHub ULTRA: initialization error');
        }

        // GLOBAL API
        window.AnimeHub = {
            home: openHome,
            search: search,
            openAnime: openAnime
        };

    });

})();