
(function(){
 const BYTE_BACK={"S20":"./assets/wa-media/wa-bytes-S20.webp","S21":"./assets/wa-media/wa-bytes-S21.webp","S22":"./assets/wa-media/wa-bytes-S22.webp","S23":"./assets/wa-media/wa-bytes-S23.webp","S24":"./assets/wa-media/wa-bytes-S24.webp","S19":"./assets/wa-media/wa-bytes-S19.webp","S18":"./assets/wa-media/wa-bytes-S18.webp","S17":"./assets/wa-media/wa-bytes-S17.webp","S16":"./assets/wa-media/wa-bytes-S16.webp","S15":"./assets/wa-media/wa-bytes-S15.webp","S14":"./assets/wa-media/wa-bytes-S14.webp","S13":"./assets/wa-media/wa-bytes-S13.webp","S12":"./assets/wa-media/wa-bytes-S12.webp","S11":"./assets/wa-media/wa-bytes-S11.webp","S10":"./assets/wa-media/wa-bytes-S10.webp","S01":"./assets/wa-media/wa-bytes-S01.webp","S02":"./assets/wa-media/wa-bytes-S02.webp","S03":"./assets/wa-media/wa-bytes-S03.webp","S04":"./assets/wa-media/wa-bytes-S04.webp","S05":"./assets/wa-media/wa-bytes-S05.webp","S06":"./assets/wa-media/wa-bytes-S06.webp","S07":"./assets/wa-media/wa-bytes-S07.webp","S08":"./assets/wa-media/wa-bytes-S08.webp","S09":"./assets/wa-media/wa-bytes-S09.webp"};
 function sidOf(card){
   const m=((card.dataset.member||"")+" "+(card.textContent||"")).match(/S\s*0?(\d{1,2})/i);
   return m ? "S"+String(parseInt(m[1],10)).padStart(2,"0") : "";
 }
 document.querySelectorAll("#memberGrid .member-card").forEach(card=>{
   const sid=sidOf(card), src=BYTE_BACK[sid];
   if(!src) return;
   const back=card.querySelector(".member-back");
   if(!back || back.querySelector(".bytes-profile-badge")) return;
   const badge=document.createElement("div");
   badge.className="bytes-profile-badge";
   badge.innerHTML='<img loading="lazy" decoding="async" decoding="async" src="'+src+'" alt="'+sid+' byteS 캐릭터">';
   back.appendChild(badge);
 });
})();
