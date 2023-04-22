


// TODO: LocalHost를 추후에 환경변수로 받아와서 ip 설정해주기 (그래야 다른 컴퓨터랑 대결 가능함)
// TODO: env 파일에서 localhost 받아오도록 수정. (External Host Port)

export const API_PORT = 3000; // TODO: 예도 끌어오기.
export const API_URL = `http://localhost:${API_PORT}/api`; // TODO: localhost를 위 방식으로 수정

export const ORIGIN_URL = `http://localhost:${API_PORT}`; // TODO: localhost를 위 방식으로 수정

export const SOCKET_PORT = 3000; // TODO: 이거 날리고 통일
export const SOCKET_URL = `http://localhost:${SOCKET_PORT}`; // TODO: localhost를 위 방식으로 수정
