
1. typescript + webpack에서 svg 로드하는 방법
    - https://stackoverflow.com/questions/44717164/unable-to-import-svg-files-in-typescript
```
declare module '*.svg' {
  const content: any;
  export default content;
}
```


2. Default image icon sets.
https://www.flaticon.com/free-sticker/woman_4825047?related_id=4825047
