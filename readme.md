# Three.js로 시작하는 WebGL

- 이 자료는 [KT Hitel](http://kthcorp.com/) 개발자 컨퍼런스인 [H3](http://h3.kthcorp.com/2012/)에서 2012년 10월 31일에 발표한 내용입니다.
- 개인 노트북에서 실행하기 위한 목적으로 만들었기 때문에 다른 실행 환경을 고려하지 않았습니다.
- [크롬 카나리] 브라우저에서 가장 잘 동작하지만 크롬, 사파리에서도 가능합니다.

## 브라우저 지원

### 인터넷 익스플로러

WebGL을 지원하지 않는 브라우저입니다. 발표 내용을 볼 수 없습니다.

### 크롬

CSS 셰이더를 사용한 예제 하나를 제외하고 정상적으로 동작합니다.

### 파이어폭스

개별 예제는 실행할 수 있지만 슬라이드 도구로 사용한 reveal.js에서 오류가 발생하여 현재 발표 내용을 정상적으로 볼 수 없습니다.

### 사파리

개발자 메뉴에서 WebGL을 활성화하고 실행하면 됩니다. CSS Shader를 사용한 예제 하나를 제외하고 정상적으로 동작합니다.

## 슬라이드

이 자료는 HTML 슬라이드 도구인 [reveal.js](https://github.com/hakimel/reveal.js)를 이용해서 만들었습니다. CSS를 H3 테마에 맞춰 수정하였으며 <iframe> 태그 등을 위해 몇 가지 옵션과 코드를 적용했습니다.

## 글꼴

영문 글꼴은 [Source Sans Pro], 고정폭 글꼴은 [Inconsolata]를 사용했습니다. 모두 [구글 웹 폰트]에서 제공하고 있어 적용시켜 놓았으니 따로 설치할 필요는 없습니다.

한글 글꼴은 맥 OS X 10.8 마운틴 라이언에 탑재된 [산돌고딕네오]를 사용했습니다. 따라서, 해당 글꼴이 없는 경우 문장폭이 맞지 않을 수 있습니다.

## CSS 셰이더

/examples/adios-webgl.html 예제는 [CSS 셰이더]를 사용합니다. [CSS 셰이더]는 현재 [크롬 카나리] 브라우저에서만 지원합니다. 이 예제를 제대로 실행하려면 아래 순서대로 해 주세요.

1. 크롬 카나리 브라우저를 설치합니다.
2. 주소창에 `chrome://flags`를 입력합니다.
3. **Enable CSS Shaders.** 항목을 활성화합니다.
4. 브라우저를 다시 실행합니다.

## 발표 자료 보기

<http://fallroot.github.com/getting-started-webgl-with-threejs/>

[크롬 카나리]: https://tools.google.com/dlpage/chromesxs
[구글 웹 폰트]: http://www.google.com/webfonts
[Source Sans Pro]: http://www.google.com/webfonts/specimen/Source+Sans+Pro
[Inconsolata]: http://www.google.com/webfonts/specimen/Inconsolata
[산돌고딕네오]: http://neo.sandoll.co.kr/
[CSS 셰이더]: http://www.w3.org/TR/filter-effects/#feCustomElement