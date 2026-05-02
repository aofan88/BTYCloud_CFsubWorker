// 部署完成後在網址後面加上這個，獲取自建節點和機場聚合節點，/?token=auto或/auto或

let mytoken = 'auto';
let guestToken = ''; //可以隨便取，或者uuid生成，https://1024tools.com/uuid
let BotToken = ''; //可以為空，或者@BotFather中輸入/start，/newbot，並關注機器人
let ChatID = ''; //可以為空，或者@userinfobot中獲取，/start
let TG = 0; //小白勿動， 開發者專用，1 為推送所有的訪問信息，0 為不推送訂閱轉換後端的訪問信息與異常訪問
let FileName = 'BTYCloud 聚合訂閱';
let SUBUpdateTime = 6; //自定義訂閱更新時間，單位小時
let total = 99;//TB
let timestamp = 4102329600000;//2099-12-31

//節點鏈接 + 訂閱鏈接
let MainData = `
https://cfxr.eu.org/getSub
`;

let urls = [];
let subConverter = "SUBAPI.cmliussss.net"; //在線訂閱轉換後端，目前使用CM的訂閱轉換功能。支持自建psub 可自行搭建https://github.com/bulianglin/psub
let subConfig = "https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/config/ACL4SSR_Online_MultiCountry.ini"; //訂閱配置文件
let subProtocol = 'https';

// -------------------------------------------------------------
// 🔒 安全配置：控制台訪問密碼
// -------------------------------------------------------------
const ADMIN_PWD = "51121";

export default {
	async fetch(request, env) {
		const userAgentHeader = request.headers.get('User-Agent');
		const userAgent = userAgentHeader ? userAgentHeader.toLowerCase() : "null";
		const url = new URL(request.url);
		const token = url.searchParams.get('token');
		mytoken = env.TOKEN || mytoken;
		BotToken = env.TGTOKEN || BotToken;
		ChatID = env.TGID || ChatID;
		TG = env.TG || TG;
		subConverter = env.SUBAPI || subConverter;
		if (subConverter.includes("http://")) {
			subConverter = subConverter.split("//")[1];
			subProtocol = 'http';
		} else {
			subConverter = subConverter.split("//")[1] || subConverter;
		}
		subConfig = env.SUBCONFIG || subConfig;
		FileName = env.SUBNAME || FileName;

		const currentDate = new Date();
		currentDate.setHours(0, 0, 0, 0);
		const timeTemp = Math.ceil(currentDate.getTime() / 1000);
		const fakeToken = await MD5MD5(`${mytoken}${timeTemp}`);
		guestToken = env.GUESTTOKEN || env.GUEST || guestToken;
		if (!guestToken) guestToken = await MD5MD5(mytoken);
		const 訪客訂閱 = guestToken;

		let UD = Math.floor(((timestamp - Date.now()) / timestamp * total * 1099511627776) / 2);
		total = total * 1099511627776;
		let expire = Math.floor(timestamp / 1000);
		SUBUpdateTime = env.SUBUPTIME || SUBUpdateTime;

		if (!([mytoken, fakeToken, 訪客訂閱].includes(token) || url.pathname == ("/" + mytoken) || url.pathname.includes("/" + mytoken + "?"))) {
			if (TG == 1 && url.pathname !== "/" && url.pathname !== "/favicon.ico") await sendMessage(`#異常訪問 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgent}</tg-spoiler>\n域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`);
			if (env.URL302) return Response.redirect(env.URL302, 302);
			else if (env.URL) return await proxyURL(env.URL, url);
			else return new Response(await nginx(), {
				status: 200,
				headers: {
					'Content-Type': 'text/html; charset=UTF-8',
				},
			});
		} else {
			if (env.KV) {
				await 遷移地址列表(env, 'LINK.txt');
				if (userAgent.includes('mozilla') && !url.search) {
					await sendMessage(`#編輯訂閱 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgentHeader}</tg-spoiler>\n域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`);
					return await KV(request, env, 'LINK.txt', 訪客訂閱);
				} else {
					MainData = await env.KV.get('LINK.txt') || MainData;
				}
			} else {
				MainData = env.LINK || MainData;
				if (env.LINKSUB) urls = await ADD(env.LINKSUB);
			}
			let 重新彙總所有鏈接 = await ADD(MainData + '\n' + urls.join('\n'));
			let 自建節點 = "";
			let 訂閱鏈接 = "";
			for (let x of 重新彙總所有鏈接) {
				if (x.toLowerCase().startsWith('http')) {
					訂閱鏈接 += x + '\n';
				} else {
					自建節點 += x + '\n';
				}
			}
			MainData = 自建節點;
			urls = await ADD(訂閱鏈接);
			await sendMessage(`#獲取訂閱 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgentHeader}</tg-spoiler>\n域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`);
			const isSubConverterRequest = request.headers.get('subconverter-request') || request.headers.get('subconverter-version') || userAgent.includes('subconverter');
			let 訂閱格式 = 'base64';
			if (!(userAgent.includes('null') || isSubConverterRequest || userAgent.includes('nekobox') || userAgent.includes(('CF-Workers-SUB').toLowerCase()))) {
				if (userAgent.includes('sing-box') || userAgent.includes('singbox') || url.searchParams.has('sb') || url.searchParams.has('singbox')) {
					訂閱格式 = 'singbox';
				} else if (userAgent.includes('surge') || url.searchParams.has('surge')) {
					訂閱格式 = 'surge';
				} else if (userAgent.includes('quantumult') || url.searchParams.has('quanx')) {
					訂閱格式 = 'quanx';
				} else if (userAgent.includes('loon') || url.searchParams.has('loon')) {
					訂閱格式 = 'loon';
				} else if (userAgent.includes('clash') || userAgent.includes('meta') || userAgent.includes('mihomo') || url.searchParams.has('clash')) {
					訂閱格式 = 'clash';
				}
			}

			let subConverterUrl;
			let 訂閱轉換URL = `${url.origin}/${await MD5MD5(fakeToken)}?token=${fakeToken}`;
			let req_data = MainData;

			let 追加UA = 'v2rayn';
			if (url.searchParams.has('b64') || url.searchParams.has('base64')) 訂閱格式 = 'base64';
			else if (url.searchParams.has('clash')) 追加UA = 'clash';
			else if (url.searchParams.has('singbox')) 追加UA = 'singbox';
			else if (url.searchParams.has('surge')) 追加UA = 'surge';
			else if (url.searchParams.has('quanx')) 追加UA = 'Quantumult%20X';
			else if (url.searchParams.has('loon')) 追加UA = 'Loon';

			const 訂閱鏈接數組 = [...new Set(urls)].filter(item => item?.trim?.()); 
			if (訂閱鏈接數組.length > 0) {
				const 請求訂閱響應內容 = await getSUB(訂閱鏈接數組, request, 追加UA, userAgentHeader);
				req_data += 請求訂閱響應內容[0].join('\n');
				訂閱轉換URL += "|" + 請求訂閱響應內容[1];
				if (訂閱格式 == 'base64' && !isSubConverterRequest && 請求訂閱響應內容[1].includes('://')) {
					subConverterUrl = `${subProtocol}://${subConverter}/sub?target=mixed&url=${encodeURIComponent(請求訂閱響應內容[1])}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
					try {
						const subConverterResponse = await fetch(subConverterUrl, { headers: { 'User-Agent': 'v2rayN/CF-Workers-SUB' } });
						if (subConverterResponse.ok) {
							const subConverterContent = await subConverterResponse.text();
							req_data += '\n' + atob(subConverterContent);
						}
					} catch (error) {
						console.log('訂閱轉換請求base64失敗');
					}
				}
			}

			if (env.WARP) 訂閱轉換URL += "|" + (await ADD(env.WARP)).join("|");
			
			const utf8Encoder = new TextEncoder();
			const encodedData = utf8Encoder.encode(req_data);
			const utf8Decoder = new TextDecoder();
			const text = utf8Decoder.decode(encodedData);

			const uniqueLines = new Set(text.split('\n'));
			const result = [...uniqueLines].join('\n');

			let base64Data;
			try {
				base64Data = btoa(result);
			} catch (e) {
				function encodeBase64(data) {
					const binary = new TextEncoder().encode(data);
					let base64 = '';
					const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

					for (let i = 0; i < binary.length; i += 3) {
						const byte1 = binary[i];
						const byte2 = binary[i + 1] || 0;
						const byte3 = binary[i + 2] || 0;

						base64 += chars[byte1 >> 2];
						base64 += chars[((byte1 & 3) << 4) | (byte2 >> 4)];
						base64 += chars[((byte2 & 15) << 2) | (byte3 >> 6)];
						base64 += chars[byte3 & 63];
					}

					const padding = 3 - (binary.length % 3 || 3);
					return base64.slice(0, base64.length - padding) + '=='.slice(0, padding);
				}
				base64Data = encodeBase64(result)
			}

			const responseHeaders = {
				"content-type": "text/plain; charset=utf-8",
				"Profile-Update-Interval": `${SUBUpdateTime}`,
				"Profile-web-page-url": request.url.includes('?') ? request.url.split('?')[0] : request.url,
			};

			if (訂閱格式 == 'base64' || token == fakeToken) {
				return new Response(base64Data, { headers: responseHeaders });
			} else if (訂閱格式 == 'clash') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=clash&url=${encodeURIComponent(訂閱轉換URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (訂閱格式 == 'singbox') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=singbox&url=${encodeURIComponent(訂閱轉換URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (訂閱格式 == 'surge') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=surge&ver=4&url=${encodeURIComponent(訂閱轉換URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (訂閱格式 == 'quanx') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=quanx&url=${encodeURIComponent(訂閱轉換URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&udp=true`;
			} else if (訂閱格式 == 'loon') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=loon&url=${encodeURIComponent(訂閱轉換URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false`;
			}
			
			try {
				const subConverterResponse = await fetch(subConverterUrl, { headers: { 'User-Agent': userAgentHeader } });
				if (!subConverterResponse.ok) return new Response(base64Data, { headers: responseHeaders });
				let subConverterContent = await subConverterResponse.text();
				if (訂閱格式 == 'clash') subConverterContent = await clashFix(subConverterContent);
				if (!userAgent.includes('mozilla')) responseHeaders["Content-Disposition"] = `attachment; filename*=utf-8''${encodeURIComponent(FileName)}`;
				return new Response(subConverterContent, { headers: responseHeaders });
			} catch (error) {
				return new Response(base64Data, { headers: responseHeaders });
			}
		}
	}
};

async function ADD(envadd) {
	var addtext = envadd.replace(/[	"'|\r\n]+/g, '\n').replace(/\n+/g, '\n');	
	if (addtext.charAt(0) == '\n') addtext = addtext.slice(1);
	if (addtext.charAt(addtext.length - 1) == '\n') addtext = addtext.slice(0, addtext.length - 1);
	const add = addtext.split('\n');
	return add;
}

async function nginx() {
	const text = `
	<!DOCTYPE html>
	<html>
	<head>
	<title>404 Not Found</title>
	<style>
		body { width: 35em; margin: 0 auto; font-family: Tahoma, Verdana, Arial, sans-serif; text-align: center; margin-top: 100px; color: #333; }
		h1 { font-size: 2em; }
	</style>
	</head>
	<body>
	<h1>404 Not Found</h1>
	<p>The requested URL was not found on this server.</p>
	</body>
	</html>
	`
	return text;
}

async function sendMessage(type, ip, add_data = "") {
	if (BotToken !== '' && ChatID !== '') {
		let msg = "";
		const response = await fetch(`http://ip-api.com/json/${ip}?lang=zh-CN`);
		if (response.status == 200) {
			const ipInfo = await response.json();
			msg = `${type}\nIP: ${ip}\n國家: ${ipInfo.country}\n<tg-spoiler>城市: ${ipInfo.city}\n組織: ${ipInfo.org}\nASN: ${ipInfo.as}\n${add_data}`;
		} else {
			msg = `${type}\nIP: ${ip}\n<tg-spoiler>${add_data}`;
		}

		let url = "https://api.telegram.org/bot" + BotToken + "/sendMessage?chat_id=" + ChatID + "&parse_mode=HTML&text=" + encodeURIComponent(msg);
		return fetch(url, {
			method: 'get',
			headers: {
				'Accept': 'text/html,application/xhtml+xml,application/xml;',
				'Accept-Encoding': 'gzip, deflate, br',
				'User-Agent': 'Mozilla/5.0 Chrome/90.0.4430.72'
			}
		});
	}
}

function base64Decode(str) {
	const bytes = new Uint8Array(atob(str).split('').map(c => c.charCodeAt(0)));
	const decoder = new TextDecoder('utf-8');
	return decoder.decode(bytes);
}

async function MD5MD5(text) {
	const encoder = new TextEncoder();
	const firstPass = await crypto.subtle.digest('MD5', encoder.encode(text));
	const firstPassArray = Array.from(new Uint8Array(firstPass));
	const firstHex = firstPassArray.map(b => b.toString(16).padStart(2, '0')).join('');
	const secondPass = await crypto.subtle.digest('MD5', encoder.encode(firstHex.slice(7, 27)));
	const secondPassArray = Array.from(new Uint8Array(secondPass));
	const secondHex = secondPassArray.map(b => b.toString(16).padStart(2, '0')).join('');
	return secondHex.toLowerCase();
}

function clashFix(content) {
	if (content.includes('wireguard') && !content.includes('remote-dns-resolve')) {
		let lines = content.includes('\r\n') ? content.split('\r\n') : content.split('\n');
		let result = "";
		for (let line of lines) {
			if (line.includes('type: wireguard')) {
				const 備改內容 = `, mtu: 1280, udp: true`;
				const 正確內容 = `, mtu: 1280, remote-dns-resolve: true, udp: true`;
				result += line.replace(new RegExp(備改內容, 'g'), 正確內容) + '\n';
			} else {
				result += line + '\n';
			}
		}
		content = result;
	}
	return content;
}

async function proxyURL(proxyURL, url) {
	const URLs = await ADD(proxyURL);
	const fullURL = URLs[Math.floor(Math.random() * URLs.length)];
	let parsedURL = new URL(fullURL);
	let URLProtocol = parsedURL.protocol.slice(0, -1) || 'https';
	let URLHostname = parsedURL.hostname;
	let URLPathname = parsedURL.pathname;
	let URLSearch = parsedURL.search;

	if (URLPathname.charAt(URLPathname.length - 1) == '/') {
		URLPathname = URLPathname.slice(0, -1);
	}
	URLPathname += url.pathname;
	let newURL = `${URLProtocol}://${URLHostname}${URLPathname}${URLSearch}`;
	let response = await fetch(newURL);

	let newResponse = new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: response.headers
	});
	newResponse.headers.set('X-New-URL', newURL);
	return newResponse;
}

async function getSUB(api, request, 追加UA, userAgentHeader) {
	if (!api || api.length === 0) return []; 
    else api = [...new Set(api)]; 
	
    let newapi = "";
	let 訂閱轉換URLs = "";
	let 異常訂閱 = "";
	const controller = new AbortController(); 
	const timeout = setTimeout(() => { controller.abort(); }, 2000);

	try {
		const responses = await Promise.allSettled(api.map(apiUrl => getUrl(request, apiUrl, 追加UA, userAgentHeader).then(response => response.ok ? response.text() : Promise.reject(response))));
		const modifiedResponses = responses.map((response, index) => {
			if (response.status === 'rejected') {
				const reason = response.reason;
				if (reason && reason.name === 'AbortError') return { status: '超時', value: null, apiUrl: api[index] };
				return { status: '請求失敗', value: null, apiUrl: api[index] };
			}
			return { status: response.status, value: response.value, apiUrl: api[index] };
		});

		for (const response of modifiedResponses) {
			if (response.status === 'fulfilled') {
				const content = await response.value || 'null'; 
				if (content.includes('proxies:')) {
					訂閱轉換URLs += "|" + response.apiUrl; 
				} else if (content.includes('outbounds"') && content.includes('inbounds"')) {
					訂閱轉換URLs += "|" + response.apiUrl; 
				} else if (content.includes('://')) {
					newapi += content + '\n'; 
				} else if (isValidBase64(content)) {
					newapi += base64Decode(content) + '\n'; 
				} else {
					const 異常訂閱LINK = `trojan://CMLiussss@127.0.0.1:8888?security=tls&allowInsecure=1&type=tcp&headerType=none#%E5%BC%82%E5%B8%B8%E8%AE%A2%E9%98%85%20${response.apiUrl.split('://')[1].split('/')[0]}`;
					異常訂閱 += `${異常訂閱LINK}\n`;
				}
			}
		}
	} catch (error) {
		console.error(error); 
	} finally {
		clearTimeout(timeout); 
	}

	const 訂閱內容 = await ADD(newapi + 異常訂閱); 
	return [訂閱內容, 訂閱轉換URLs];
}

async function getUrl(request, targetUrl, 追加UA, userAgentHeader) {
	const newHeaders = new Headers(request.headers);
	newHeaders.set("User-Agent", `${atob('djJyYXlOLzYuNDU=')} cmliu/CF-Workers-SUB ${追加UA}(${userAgentHeader})`);
	const modifiedRequest = new Request(targetUrl, {
		method: request.method,
		headers: newHeaders,
		body: request.method === "GET" ? null : request.body,
		redirect: "follow",
		cf: { insecureSkipVerify: true, allowUntrusted: true, validateCertificate: false }
	});
	return fetch(modifiedRequest);
}

function isValidBase64(str) {
	const cleanStr = str.replace(/\s/g, '');
	const base64Regex = /^[A-Za-z0-9+/=]+$/;
	return base64Regex.test(cleanStr);
}

async function 遷移地址列表(env, txt = 'ADD.txt') {
	const 舊數據 = await env.KV.get(`/${txt}`);
	const 新數據 = await env.KV.get(txt);
	if (舊數據 && !新數據) {
		await env.KV.put(txt, 舊數據);
		await env.KV.delete(`/${txt}`);
		return true;
	}
	return false;
}

// -------------------------------------------------------------
// 🔥 全新重構的 BTYCloud 定製 UI 介面 (V5.1 Ultra)
// -------------------------------------------------------------
async function KV(request, env, txt = 'ADD.txt', guest) {
	const url = new URL(request.url);
	try {
        // 伺服器端密碼校驗 & 保存邏輯
		if (request.method === "POST") {
			if (!env.KV) return new Response(JSON.stringify({error: "未綁定KV空間"}), { status: 400 });
			try {
                const reqData = await request.json();
                if (reqData.pwd !== ADMIN_PWD) {
                    return new Response(JSON.stringify({error: "Unauthorized"}), { status: 401, headers: {"Content-Type": "application/json"} });
                }

                if (reqData.action === 'get') {
                    const content = await env.KV.get(txt) || '';
                    return new Response(JSON.stringify({content: content}), { headers: {"Content-Type": "application/json"} });
                } 
                else if (reqData.action === 'save') {
                    await env.KV.put(txt, reqData.content);
                    return new Response(JSON.stringify({success: true}), { headers: {"Content-Type": "application/json"} });
                }
			} catch (error) {
				return new Response(JSON.stringify({error: error.message}), { status: 500, headers: {"Content-Type": "application/json"} });
			}
		}

		let hasKV = !!env.KV;

        // 定製卡片陣列
        const subLinks = [
            { name: "自適應", path: "?sub", color: "#3b82f6" },
            { name: "Base64", path: "?b64", color: "#0ea5e9" },
            { name: "Clash", path: "?clash", color: "#8b5cf6" },
            { name: "Sing-box", path: "?sb", color: "#10b981" },
            { name: "Surge", path: "?surge", color: "#f43f5e" },
            { name: "Loon", path: "?loon", color: "#f97316" }
        ];

		const html = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BTYCloud 訂閱管理中心</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        /* 日夜雙模切換變數 */
        :root { 
            --bg: #0f172a; 
            --glass-bg: rgba(30, 41, 59, 0.65); 
            --glass-border: rgba(255, 255, 255, 0.08);
            --accent: #3b82f6; 
            --text-main: #f8fafc; 
            --text-dim: #94a3b8; 
            --input-bg: rgba(15, 23, 42, 0.6);
            --input-text: #38bdf8;
            --modal-bg: rgba(15, 23, 42, 0.8);
            --modal-content: #1e293b;
        }
        
        :root.light-theme {
            --bg: #f8fafc;
            --glass-bg: rgba(255, 255, 255, 0.7);
            --glass-border: rgba(0, 0, 0, 0.05);
            --accent: #2563eb;
            --text-main: #0f172a;
            --text-dim: #64748b;
            --input-bg: #f1f5f9;
            --input-text: #0284c7;
            --modal-bg: rgba(255, 255, 255, 0.7);
            --modal-content: #ffffff;
        }

        body { font-family: 'Inter', sans-serif; background-color: var(--bg); color: var(--text-main); transition: 0.4s ease; margin: 0; min-height: 100vh; overflow-x: hidden;}
        .mono { font-family: 'JetBrains Mono', monospace; }
        
        /* 網頁動態光暈背景 */
        .blob-1 { position: fixed; top: -10%; left: -10%; width: 50vw; height: 50vw; border-radius: 50%; background: radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 60%); filter: blur(60px); z-index: -1; animation: float 10s infinite ease-in-out alternate; pointer-events: none;}
        .blob-2 { position: fixed; bottom: -10%; right: -10%; width: 60vw; height: 60vw; border-radius: 50%; background: radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 60%); filter: blur(60px); z-index: -1; animation: float 12s infinite ease-in-out alternate-reverse; pointer-events: none;}
        @keyframes float { 0% { transform: translate(0, 0); } 100% { transform: translate(30px, 50px); } }

        /* 毛玻璃卡片 */
        .glass-card { background: var(--glass-bg); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid var(--glass-border); border-radius: 1.25rem; padding: 24px; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.1); transition: 0.3s; }
        
        /* 自定義滾動條 */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--glass-border); border-radius: 10px; }

        /* 標題與字體 */
        .card-title { font-size: 1.1rem; font-weight: 600; color: var(--text-main); border-bottom: 1px solid var(--glass-border); padding-bottom: 12px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; }
        
        /* 輸入框與按鈕 */
        .pwd-input { padding: 12px 20px; font-size: 16px; border: 1px solid var(--glass-border); border-radius: 12px; width: 220px; text-align: center; outline: none; background: var(--input-bg); color: var(--text-main); transition: 0.2s; letter-spacing: 2px;}
        .pwd-input:focus { border-color: var(--accent); box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2); }
        
        .editor { width: 100%; height: 180px; background-color: var(--input-bg); color: var(--input-text); font-family: 'JetBrains Mono', monospace; font-size: 13px; padding: 16px; border: 1px solid var(--glass-border); border-radius: 12px; resize: vertical; line-height: 1.6; outline: none; transition: 0.3s; }
        .editor:focus { border-color: var(--accent); }
        
        .btn { padding: 8px 20px; border: none; border-radius: 10px; cursor: pointer; font-weight: 500; font-size: 13px; transition: all 0.2s; }
        .btn-primary { background-color: var(--accent); color: white; }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
        .btn-outline { background: transparent; border: 1px solid var(--glass-border); color: var(--text-main); padding: 6px 14px; }
        .btn-outline:hover { background: var(--input-bg); }

        /* 子訂閱卡片 */
        .sub-card { border: 1px solid var(--glass-border); border-radius: 12px; padding: 16px; text-align: center; transition: all 0.2s; background: rgba(255,255,255,0.02); }
        .sub-card:hover { border-color: var(--accent); transform: translateY(-2px); background: rgba(255,255,255,0.05); }
        .sub-title { font-weight: 600; font-size: 13px; margin-bottom: 12px; display: inline-block; padding: 4px 12px; border-radius: 20px; color: white; letter-spacing: 0.5px; }
        .sub-link { font-size: 11px; color: var(--text-dim); word-break: break-all; margin-bottom: 16px; user-select: all; font-family: 'JetBrains Mono', monospace;}
        
        /* 彈窗 */
        #toast { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); background: var(--accent); color: white; padding: 12px 24px; border-radius: 30px; font-size: 14px; font-weight: 500; opacity: 0; pointer-events: none; transition: 0.3s; z-index: 1000; box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2); }
        .toast-show { opacity: 1 !important; transform: translate(-50%, -10px) !important; }

        .guest-section { display: none; margin-top: 24px; padding-top: 24px; border-top: 1px dashed var(--glass-border); }
        .toggle-guest { color: var(--text-dim); cursor: pointer; font-size: 13px; text-align: center; margin-top: 24px; transition: 0.2s; }
        .toggle-guest:hover { color: var(--text-main); }

        .modal { display: none; position: fixed; z-index: 100; left: 0; top: 0; width: 100%; height: 100%; background-color: var(--modal-bg); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); align-items: center; justify-content: center; }
        .modal-content { background-color: var(--modal-content); padding: 30px; border-radius: 24px; text-align: center; max-width: 320px; position: relative; border: 1px solid var(--glass-border); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
        .close { position: absolute; top: 12px; right: 20px; color: var(--text-dim); font-size: 24px; cursor: pointer; transition: 0.2s;}
        .close:hover { color: var(--text-main); }
        #qrcode_canvas { display: flex; justify-content: center; margin-top: 20px; padding: 10px; background: white; border-radius: 16px; }

        .theme-switch { cursor: pointer; padding: 8px; border-radius: 50%; background: var(--glass-bg); border: 1px solid var(--glass-border); color: var(--text-main); transition: 0.3s; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;}
        .theme-switch:hover { background: var(--input-bg); }
    </style>
</head>
<body>

<div class="blob-1"></div>
<div class="blob-2"></div>

<div id="toast">操作成功</div>

<div id="qrModal" class="modal">
    <div class="modal-content">
        <span class="close" onclick="closeModal()">&times;</span>
        <h3 style="margin-top:0; color:var(--text-main); font-weight: 600; font-size: 18px;">設備掃碼</h3>
        <p style="font-size: 12px; color: var(--text-dim); margin-top: 5px;">請使用代理客戶端掃描二維碼</p>
        <div id="qrcode_canvas"></div>
    </div>
</div>

<div class="max-w-4xl mx-auto px-6 pb-12">
    <header class="flex justify-between items-center py-10">
        <div class="flex items-center gap-3">
            <div class="text-2xl font-black tracking-tight cursor-pointer">
                <span style="color: #3b82f6;">BTY</span><span style="color: var(--text-main);">Cloud</span>
            </div>
            <div style="height: 18px; width: 1px; background-color: var(--glass-border);"></div>
            <div class="text-sm font-medium tracking-widest" style="color: var(--text-dim);">八通雲計算服務</div>
        </div>
        <button class="theme-switch text-xl" onclick="toggleTheme()" id="themeIcon">🌙</button>
    </header>

    <div class="flex flex-col gap-6">

        <div class="glass-card">
            <h2 class="card-title">
                <span>📝 配置編輯 Edit Config</span>
            </h2>
            
            ${hasKV ? `
            <div id="lock-screen" class="text-center py-10">
                <p class="text-sm mb-6" style="color: var(--text-dim);">系統已鎖定，請輸入金鑰</p>
                <div class="flex justify-center gap-3">
                    <input type="password" id="adminPwd" class="pwd-input" placeholder="•••••" onkeypress="if(event.keyCode==13) unlockEditor()">
                    <button class="btn btn-primary" onclick="unlockEditor()">解鎖</button>
                </div>
                <p id="lockError" class="text-sm mt-4 text-red-400 hidden">❌ 金鑰無效</p>
            </div>

            <div id="editor-screen" style="display:none;">
                <textarea id="content" class="editor" placeholder="每行輸入一個節點鏈接或訂閱鏈接...&#10;例如:&#10;vless://...&#10;https://.../sub" spellcheck="false"></textarea>
                <div class="flex justify-between items-center mt-4">
                    <span class="text-xs mono" id="saveStatus" style="color: var(--text-dim);">就緒</span>
                    <button class="btn btn-primary" id="saveBtn" onclick="saveContent(this)">保存</button>
                </div>
            </div>
            ` : '<p class="text-red-400 text-center text-sm">⚠️ 未綁定 KV 命名空間，無法保存配置。</p>'}
        </div>

        <div class="glass-card">
            <h2 class="card-title">
                <span>🔗 獲取訂閱 Get Sub</span>
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                ${subLinks.map((item) => `
                <div class="sub-card">
                    <div class="sub-title" style="background-color: ${item.color}">${item.name}</div>
                    <div class="sub-link">https://${url.hostname}/${mytoken}${item.path}</div>
                    <div class="flex gap-2 justify-center">
                        <button class="btn btn-outline" onclick="copyText('https://${url.hostname}/${mytoken}${item.path}')">複製</button>
                        <button class="btn btn-outline" onclick="showQR('https://${url.hostname}/${mytoken}${item.path}')">掃碼</button>
                    </div>
                </div>
                `).join('')}
            </div>

            <div class="toggle-guest" onclick="toggleGuest()">展開訪客專用節點</div>
            
            <div id="guestSection" class="guest-section">
                <h2 class="card-title" style="border-bottom:none; margin-bottom:5px;">👤 訪客專用 Guest Sub</h2>
                <p style="font-size:12px; margin-bottom:20px; color: var(--text-dim);">
                    專用 Token: <code class="mono px-2 py-1 rounded bg-black/20 dark:bg-white/10 text-xs">${guest}</code>
                </p>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    ${subLinks.map((item) => `
                    <div class="sub-card">
                        <div class="sub-title" style="background-color: ${item.color}">${item.name}</div>
                        <div class="sub-link">https://${url.hostname}/sub?token=${guest}${item.path.replace('?', '&')}</div>
                        <div class="flex gap-2 justify-center">
                            <button class="btn btn-outline" onclick="copyText('https://${url.hostname}/sub?token=${guest}${item.path.replace('?', '&')}')">複製</button>
                            <button class="btn btn-outline" onclick="showQR('https://${url.hostname}/sub?token=${guest}${item.path.replace('?', '&')}')">掃碼</button>
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>
        </div>
    </div>

    <div class="text-center mt-12 mb-4 space-y-2 text-sm">
        <p style="color: var(--text-dim);">
            ⚡️ Powered by <a href="https://btycloud.top" target="_blank" class="font-bold text-blue-500 hover:text-blue-400 transition-colors">BTYCloud 八通雲計算服務</a>
        </p>
        <p class="text-xs" style="color: var(--text-dim);">
            A Strategic Infrastructure Division of <a href="https://runsinggroup.com" target="_blank" class="font-bold hover:text-gray-300 transition-colors">潤昇創新 (RunSing Innovation)</a>
        </p>
    </div>
</div>

<script>
    // 主題切換
    const themeIcon = document.getElementById('themeIcon');
    function initTheme() {
        const savedTheme = localStorage.getItem('bty-theme');
        if (savedTheme === 'light') {
            document.documentElement.classList.add('light-theme');
            themeIcon.textContent = '☀️';
        } else {
            themeIcon.textContent = '🌙';
        }
    }
    function toggleTheme() {
        document.documentElement.classList.toggle('light-theme');
        const isLight = document.documentElement.classList.contains('light-theme');
        localStorage.setItem('bty-theme', isLight ? 'light' : 'dark');
        themeIcon.textContent = isLight ? '☀️' : '🌙';
    }
    initTheme();

    let sessionPwd = ""; 

    // Toast
    function showToast(msg) {
        const toast = document.getElementById('toast');
        toast.textContent = msg;
        toast.classList.add('toast-show');
        setTimeout(() => toast.classList.remove('toast-show'), 2500);
    }

    // 複製
    function copyText(text) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('✅ 已複製到剪貼板');
        }).catch(err => {
            alert('複製失敗，請手動複製');
        });
    }

    // 二維碼 (改用穩定的外部 API 渲染圖片)
    function showQR(text) {
        document.getElementById('qrModal').style.display = 'flex';
        const qrContainer = document.getElementById('qrcode_canvas');
        // 直接使用 API 生成圖片，徹底解決 Canvas 渲染報錯的問題
        qrContainer.innerHTML = \`<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=\${encodeURIComponent(text)}&margin=10" alt="QR Code" style="border-radius: 12px; width: 200px; height: 200px;">\`;
    }

    function closeModal() {
        document.getElementById('qrModal').style.display = 'none';
        document.getElementById('qrcode_canvas').innerHTML = ''; // 關閉時清空
    }
    window.onclick = function(event) {
        const modal = document.getElementById('qrModal');
        if (event.target == modal) closeModal();
    }

    // 訪客區
    function toggleGuest() {
        const el = document.getElementById('guestSection');
        el.style.display = el.style.display === 'block' ? 'none' : 'block';
    }

    // 安全與保存
    if (document.querySelector('#lock-screen')) {
        let timer;
        const textarea = document.getElementById('content');
        const btn = document.getElementById('saveBtn');
        const status = document.getElementById('saveStatus');

        async function unlockEditor() {
            const pwdInput = document.getElementById('adminPwd');
            const pwd = pwdInput.value;
            if(!pwd) return;
            
            pwdInput.disabled = true;
            try {
                const res = await fetch(window.location.href, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({action: 'get', pwd: pwd})
                });
                
                if(res.ok) {
                    const data = await res.json();
                    textarea.value = data.content;
                    sessionPwd = pwd; 
                    document.getElementById('lock-screen').style.display = 'none';
                    document.getElementById('editor-screen').style.display = 'block';
                    showToast('🔓 已解鎖');
                } else {
                    document.getElementById('lockError').style.display = 'block';
                    pwdInput.disabled = false;
                    pwdInput.value = '';
                }
            } catch(e) {
                document.getElementById('lockError').textContent = '❌ 網絡錯誤';
                document.getElementById('lockError').style.display = 'block';
                pwdInput.disabled = false;
            }
        }

        function saveContent(buttonElement) {
            if(!sessionPwd) return;

            if (!/iPad|iPhone|iPod/.test(navigator.userAgent)) {
                textarea.value = textarea.value.replace(/：/g, ':');
            }
            const newContent = textarea.value;
            
            buttonElement.textContent = '保存中...';
            buttonElement.disabled = true;
            status.textContent = '正在寫入...';

            fetch(window.location.href, {
                method: 'POST',
                body: JSON.stringify({action: 'save', pwd: sessionPwd, content: newContent}),
                headers: { 'Content-Type': 'application/json' },
                cache: 'no-cache'
            })
            .then(response => {
                if (!response.ok) throw new Error('HTTP ' + response.status);
                status.textContent = '✅ 已保存 (' + new Date().toLocaleTimeString() + ')';
                buttonElement.textContent = '已保存';
                showToast('✅ 配置已更新');
            })
            .catch(error => {
                status.textContent = '❌ 失敗: ' + error.message;
                buttonElement.textContent = '重試';
                showToast('❌ 保存失敗');
            })
            .finally(() => {
                setTimeout(() => {
                    buttonElement.textContent = '保存';
                    buttonElement.disabled = false;
                }, 2000);
            });
        }

        textarea.addEventListener('input', () => {
            status.textContent = '等待保存...';
            clearTimeout(timer);
            timer = setTimeout(() => saveContent(btn), 3000); 
        });
        
        window.unlockEditor = unlockEditor;
    }
</script>
</body>
</html>
		`;

		return new Response(html, {
			headers: { "Content-Type": "text/html;charset=utf-8" }
		});
	} catch (error) {
		console.error('處理請求時發生錯誤:', error);
		return new Response("服務器錯誤: " + error.message, {
			status: 500,
			headers: { "Content-Type": "text/plain;charset=utf-8" }
		});
	}
}
