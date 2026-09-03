-- Seed: Airtel Money (sidebar-top) and IkiminaOS (sidebar-bottom) HTML ads

insert into advertisements (title, image_url, link_url, slot, ad_type, html_content, is_active, sort_order)
values (
  'Airtel Money',
  '',
  'https://airtel.africa',
  'sidebar-top',
  'html',
  '<div style="position:relative;width:300px;height:250px;border-radius:12px;overflow:hidden;background:linear-gradient(160deg,#e40000 0%,#c20000 55%,#8f0000 100%);font-family:''Inter'',Arial,sans-serif;color:#fff;display:flex;flex-direction:column;box-shadow:inset 0 0 0 2px rgba(255,255,255,0.08);">
  <style>
    .am-pulse{width:14px;height:14px;border-radius:50%;background:#ffd400;display:inline-block;animation:amp 1.6s ease-in-out infinite;}
    @keyframes amp{0%{transform:scale(0.6);opacity:0.6;}50%{transform:scale(1.15);opacity:1;}100%{transform:scale(0.6);opacity:0.6;}}
    .am-float{animation:amf 3s ease-in-out infinite;display:inline-block;}
    @keyframes amf{0%{transform:translateY(0);}50%{transform:translateY(-6px);}100%{transform:translateY(0);}}
    .am-shine{position:absolute;top:0;left:-60%;width:50%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent);animation:ams 3.5s ease-in-out infinite;}
    @keyframes ams{0%{left:-60%;}55%{left:110%;}100%{left:110%;}}
  </style>
  <div class="am-shine"></div>
  <div style="padding:14px 16px 8px;display:flex;align-items:center;gap:8px;">
    <span class="am-pulse"></span>
    <span style="font-weight:800;font-size:15px;letter-spacing:0.5px;">AIRTEL&nbsp;MONEY</span>
  </div>
  <div style="flex:1;padding:6px 16px;display:flex;flex-direction:column;justify-content:center;">
    <div class="am-float" style="font-weight:900;font-size:26px;line-height:1.05;letter-spacing:-0.5px;">Send, receive<br/>&amp; pay with ease</div>
    <div style="margin-top:8px;font-size:12.5px;color:#ffe8e8;line-height:1.4;">Fast, secure mobile money for every Rwandan. Pay bills, send to any wallet and buy airtime anytime.</div>
  </div>
  <div style="padding:8px 16px 16px;">
    <a href="https://airtel.africa" target="_blank" rel="noopener" style="display:inline-block;background:#ffd400;color:#7a0c0c;font-weight:800;font-size:13px;padding:9px 20px;border-radius:999px;text-decoration:none;box-shadow:0 4px 12px rgba(0,0,0,0.25);">Get Started &rarr;</a>
  </div>
</div>',
  1,
  20
);

insert into advertisements (title, image_url, link_url, slot, ad_type, html_content, is_active, sort_order)
values (
  'IkiminaOS',
  '',
  'https://ikimina.freebuff.app',
  'sidebar-bottom',
  'html',
  '<div style="position:relative;width:300px;height:250px;border-radius:12px;overflow:hidden;background:linear-gradient(160deg,#0f5132 0%,#166b42 50%,#0e4228 100%);font-family:''Inter'',Arial,sans-serif;color:#f1f7f2;display:flex;flex-direction:column;box-shadow:inset 0 0 0 2px rgba(255,255,255,0.07);">
  <style>
    .ik-coin{font-size:20px;display:inline-block;animation:ikc 2.2s ease-in-out infinite;}
    @keyframes ikc{0%{transform:translateY(0) rotate(-8deg);}50%{transform:translateY(-5px) rotate(8deg);}100%{transform:translateY(0) rotate(-8deg);}}
    .ik-grow{animation:ikg 2.6s ease-in-out infinite;}
    @keyframes ikg{0%{opacity:0.85;}50%{opacity:1.15;}100%{opacity:0.85;}}
    .ik-ring{position:absolute;top:14px;right:14px;width:46px;height:46px;border:3px solid rgba(255,255,255,0.35);border-radius:50%;animation:ikr 2.2s linear infinite;}
    @keyframes ikr{0%{transform:scale(0.5);opacity:0.9;}100%{transform:scale(1.5);opacity:0;}}
  </style>
  <div class="ik-ring"></div>
  <div style="padding:14px 16px 4px;display:flex;align-items:center;gap:8px;">
    <span class="ik-coin">&#x1F4B0;</span>
    <span style="font-weight:800;font-size:16px;letter-spacing:0.3px;">Ikimina<span style="color:#7fdba3;">OS</span></span>
  </div>
  <div style="flex:1;padding:6px 16px;display:flex;flex-direction:column;justify-content:center;">
    <div class="ik-grow" style="font-weight:900;font-size:23px;line-height:1.1;">Save together,<br/>grow together</div>
    <div style="margin-top:8px;font-size:12.5px;color:#d3ecdc;line-height:1.4;">Digital ibimina for your community. Transparent savings, fair loans and dividends - right from your phone.</div>
  </div>
  <div style="padding:8px 16px 16px;">
    <a href="https://ikimina.freebuff.app" target="_blank" rel="noopener" style="display:inline-block;background:#2c9750;color:#fff;font-weight:800;font-size:13px;padding:9px 22px;border-radius:999px;text-decoration:none;box-shadow:0 4px 12px rgba(0,0,0,0.25);">Join IkiminaOS &rarr;</a>
  </div>
</div>',
  1,
  30
);
