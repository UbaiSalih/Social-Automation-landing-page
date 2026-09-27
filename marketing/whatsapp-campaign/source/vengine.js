<script>
const START=window.SCENE_STARTS; const scenes=[...document.querySelectorAll('.scene')];
scenes.forEach((sc,i)=>{const s=START[i],e=START[i+1];
  sc.style.animation=i===scenes.length-1?`sceneIn .5s ${s}s both`:`sceneIn .5s ${s}s both, sceneOut .4s ${(e-0.4).toFixed(2)}s forwards`;
  sc.querySelectorAll('[data-d]').forEach(el=>el.style.animationDelay=(s+ +el.dataset.d)+'s');});
const foot=document.getElementById('foot'); if(foot) foot.style.animation=`fade .5s .3s both, fadeOut .4s ${START[START.length-2]}s forwards`;
window.seek=t=>document.getAnimations().forEach(a=>{a.pause();a.currentTime=t*1000});
</script>
