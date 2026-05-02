// 部署完成后在网址后面加上这个，获取自建节点和机场聚合节点，/?token=auto或/auto或

let mytoken = 'auto';
let guestToken = ''; //可以随便取，或者uuid生成，https://1024tools.com/uuid
let BotToken = ''; //可以为空，或者@BotFather中输入/start，/newbot，并关注机器人
let ChatID = ''; //可以为空，或者@userinfobot中获取，/start
let TG = 0; //小白勿动， 开发者专用，1 为推送所有的访问信息，0 为不推送订阅转换后端的访问信息与异常访问
let FileName = '聚合订阅终端';
let SUBUpdateTime = 6; //自定义订阅更新时间，单位小时
let total = 99;//TB
let timestamp = 4102329600000;//2099-12-31

//节点链接 + 订阅链接
let MainData = `
https://cfxr.eu.org/getSub
`;

let urls = [];
let subConverter = "SUBAPI.cmliussss.net"; //在线订阅转换后端，目前使用CM的订阅转换功能。支持自建psub 可自行搭建https://github.com/bulianglin/psub
let subConfig = "https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/config/ACL4SSR_Online_MultiCountry.ini"; //订阅配置文件
let subProtocol = 'https';

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
		const 访客订阅 = guestToken;

		let UD = Math.floor(((timestamp - Date.now()) / timestamp * total * 1099511627776) / 2);
		total = total * 1099511627776;
		let expire = Math.floor(timestamp / 1000);
		SUBUpdateTime = env.SUBUPTIME || SUBUpdateTime;

		if (!([mytoken, fakeToken, 访客订阅].includes(token) || url.pathname == ("/" + mytoken) || url.pathname.includes("/" + mytoken + "?"))) {
			if (TG == 1 && url.pathname !== "/" && url.pathname !== "/favicon.ico") await sendMessage(`#异常访问 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgent}</tg-spoiler>\n域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`);
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
				await 迁移地址列表(env, 'LINK.txt');
				if (userAgent.includes('mozilla') && !url.search) {
					await sendMessage(`#编辑订阅 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgentHeader}</tg-spoiler>\n域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`);
					return await KV(request, env, 'LINK.txt', 访客订阅);
				} else {
					MainData = await env.KV.get('LINK.txt') || MainData;
				}
			} else {
				MainData = env.LINK || MainData;
				if (env.LINKSUB) urls = await ADD(env.LINKSUB);
			}
			let 重新汇总所有链接 = await ADD(MainData + '\n' + urls.join('\n'));
			let 自建节点 = "";
			let 订阅链接 = "";
			for (let x of 重新汇总所有链接) {
				if (x.toLowerCase().startsWith('http')) {
					订阅链接 += x + '\n';
				} else {
					自建节点 += x + '\n';
				}
			}
			MainData = 自建节点;
			urls = await ADD(订阅链接);
			await sendMessage(`#获取订阅 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgentHeader}</tg-spoiler>\n域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`);
			const isSubConverterRequest = request.headers.get('subconverter-request') || request.headers.get('subconverter-version') || userAgent.includes('subconverter');
			let 订阅格式 = 'base64';
			if (!(userAgent.includes('null') || isSubConverterRequest || userAgent.includes('nekobox') || userAgent.includes(('CF-Workers-SUB').toLowerCase()))) {
				if (userAgent.includes('sing-box') || userAgent.includes('singbox') || url.searchParams.has('sb') || url.searchParams.has('singbox')) {
					订阅格式 = 'singbox';
				} else if (userAgent.includes('surge') || url.searchParams.has('surge')) {
					订阅格式 = 'surge';
				} else if (userAgent.includes('quantumult') || url.searchParams.has('quanx')) {
					订阅格式 = 'quanx';
				} else if (userAgent.includes('loon') || url.searchParams.has('loon')) {
					订阅格式 = 'loon';
				} else if (userAgent.includes('clash') || userAgent.includes('meta') || userAgent.includes('mihomo') || url.searchParams.has('clash')) {
					订阅格式 = 'clash';
				}
			}

			let subConverterUrl;
			let 订阅转换URL = `${url.origin}/${await MD5MD5(fakeToken)}?token=${fakeToken}`;
			let req_data = MainData;

			let 追加UA = 'v2rayn';
			if (url.searchParams.has('b64') || url.searchParams.has('base64')) 订阅格式 = 'base64';
			else if (url.searchParams.has('clash')) 追加UA = 'clash';
			else if (url.searchParams.has('singbox')) 追加UA = 'singbox';
			else if (url.searchParams.has('surge')) 追加UA = 'surge';
			else if (url.searchParams.has('quanx')) 追加UA = 'Quantumult%20X';
			else if (url.searchParams.has('loon')) 追加UA = 'Loon';

			const 订阅链接数组 = [...new Set(urls)].filter(item => item?.trim?.()); 
			if (订阅链接数组.length > 0) {
				const 请求订阅响应内容 = await getSUB(订阅链接数组, request, 追加UA, userAgentHeader);
				req_data += 请求订阅响应内容[0].join('\n');
				订阅转换URL += "|" + 请求订阅响应内容[1];
				if (订阅格式 == 'base64' && !isSubConverterRequest && 请求订阅响应内容[1].includes('://')) {
					subConverterUrl = `${subProtocol}://${subConverter}/sub?target=mixed&url=${encodeURIComponent(请求订阅响应内容[1])}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
					try {
						const subConverterResponse = await fetch(subConverterUrl, { headers: { 'User-Agent': 'v2rayN/CF-Workers-SUB' } });
						if (subConverterResponse.ok) {
							const subConverterContent = await subConverterResponse.text();
							req_data += '\n' + atob(subConverterContent);
						}
					} catch (error) {
						console.log('订阅转换请回base64失败');
					}
				}
			}

			if (env.WARP) 订阅转换URL += "|" + (await ADD(env.WARP)).join("|");
			
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

			if (订阅格式 == 'base64' || token == fakeToken) {
				return new Response(base64Data, { headers: responseHeaders });
			} else if (订阅格式 == 'clash') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=clash&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (订阅格式 == 'singbox') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=singbox&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (订阅格式 == 'surge') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=surge&ver=4&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (订阅格式 == 'quanx') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=quanx&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&udp=true`;
			} else if (订阅格式 == 'loon') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=loon&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false`;
			}
			
			try {
				const subConverterResponse = await fetch(subConverterUrl, { headers: { 'User-Agent': userAgentHeader } });
				if (!subConverterResponse.ok) return new Response(base64Data, { headers: responseHeaders });
				let subConverterContent = await subConverterResponse.text();
				if (订阅格式 == 'clash') subConverterContent = await clashFix(subConverterContent);
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
			msg = `${type}\nIP: ${ip}\n国家: ${ipInfo.country}\n<tg-spoiler>城市: ${ipInfo.city}\n组织: ${ipInfo.org}\nASN: ${ipInfo.as}\n${add_data}`;
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
				const 备改内容 = `, mtu: 1280, udp: true`;
				const 正确内容 = `, mtu: 1280, remote-dns-resolve: true, udp: true`;
				result += line.replace(new RegExp(备改内容, 'g'), 正确内容) + '\n';
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
	let 订阅转换URLs = "";
	let 异常订阅 = "";
	const controller = new AbortController(); 
	const timeout = setTimeout(() => { controller.abort(); }, 2000);

	try {
		const responses = await Promise.allSettled(api.map(apiUrl => getUrl(request, apiUrl, 追加UA, userAgentHeader).then(response => response.ok ? response.text() : Promise.reject(response))));
		const modifiedResponses = responses.map((response, index) => {
			if (response.status === 'rejected') {
				const reason = response.reason;
				if (reason && reason.name === 'AbortError') return { status: '超时', value: null, apiUrl: api[index] };
				return { status: '请求失败', value: null, apiUrl: api[index] };
			}
			return { status: response.status, value: response.value, apiUrl: api[index] };
		});

		for (const response of modifiedResponses) {
			if (response.status === 'fulfilled') {
				const content = await response.value || 'null'; 
				if (content.includes('proxies:')) {
					订阅转换URLs += "|" + response.apiUrl; 
				} else if (content.includes('outbounds"') && content.includes('inbounds"')) {
					订阅转换URLs += "|" + response.apiUrl; 
				} else if (content.includes('://')) {
					newapi += content + '\n'; 
				} else if (isValidBase64(content)) {
					newapi += base64Decode(content) + '\n'; 
				} else {
					const 异常订阅LINK = `trojan://CMLiussss@127.0.0.1:8888?security=tls&allowInsecure=1&type=tcp&headerType=none#%E5%BC%82%E5%B8%B8%E8%AE%A2%E9%98%85%20${response.apiUrl.split('://')[1].split('/')[0]}`;
					异常订阅 += `${异常订阅LINK}\n`;
				}
			}
		}
	} catch (error) {
		console.error(error); 
	} finally {
		clearTimeout(timeout); 
	}

	const 订阅内容 = await ADD(newapi + 异常订阅); 
	return [订阅内容, 订阅转换URLs];
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

async function 迁移地址列表(env, txt = 'ADD.txt') {
	const 旧数据 = await env.KV.get(`/${txt}`);
	const 新数据 = await env.KV.get(txt);
	if (旧数据 && !新数据) {
		await env.KV.put(txt, 旧数据);
		await env.KV.delete(`/${txt}`);
		return true;
	}
	return false;
}

// -------------------------------------------------------------
// 🔥 全新重构的 UI 介面
// -------------------------------------------------------------
async function KV(request, env, txt = 'ADD.txt', guest) {
	const url = new URL(request.url);
	try {
		if (request.method === "POST") {
			if (!env.KV) return new Response("未绑定KV空间", { status: 400 });
			try {
				const content = await request.text();
				await env.KV.put(txt, content);
				return new Response("保存成功");
			} catch (error) {
				return new Response("保存失败: " + error.message, { status: 500 });
			}
		}

		let content = '';
		let hasKV = !!env.KV;
		if (hasKV) {
			try { content = await env.KV.get(txt) || ''; } 
            catch (error) { content = '读取数据时发生错误: ' + error.message; }
		}

        // 定製卡片陣列
        const subLinks = [
            { name: "自适应", path: "?sub", color: "#4f46e5" },
            { name: "Base64", path: "?b64", color: "#0ea5e9" },
            { name: "Clash", path: "?clash", color: "#d946ef" },
            { name: "Sing-box", path: "?sb", color: "#8b5cf6" },
            { name: "Surge", path: "?surge", color: "#f43f5e" },
            { name: "Loon", path: "?loon", color: "#f97316" }
        ];

		const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${FileName} 管理面板</title>
    <style>
        :root {
            --bg-color: #f3f4f6;
            --card-bg: #ffffff;
            --text-main: #1f2937;
            --text-muted: #6b7280;
            --primary: #2563eb;
            --primary-hover: #1d4ed8;
            --success: #10b981;
            --border-radius: 12px;
        }
        * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        body { background-color: var(--bg-color); color: var(--text-main); margin: 0; padding: 20px; line-height: 1.6; }
        
        .container { max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
        .header { text-align: center; padding: 20px 0; }
        .header h1 { margin: 0; font-size: 24px; color: var(--text-main); display: flex; align-items: center; justify-content: center; gap: 10px; }
        
        .card { background: var(--card-bg); border-radius: var(--border-radius); padding: 25px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .card-title { margin-top: 0; font-size: 18px; color: var(--text-main); border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 20px; }
        
        /* 编辑器样式 */
        .editor-wrapper { position: relative; }
        .editor { width: 100%; height: 280px; background-color: #1e1e1e; color: #d4d4d4; font-family: 'Courier New', Courier, monospace; font-size: 14px; padding: 15px; border: none; border-radius: 8px; resize: vertical; line-height: 1.5; outline: none; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); }
        .editor:focus { border: 1px solid var(--primary); }
        .action-bar { display: flex; justify-content: space-between; align-items: center; margin-top: 15px; }
        .btn { padding: 8px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.2s; }
        .btn-primary { background-color: var(--primary); color: white; }
        .btn-primary:hover { background-color: var(--primary-hover); transform: translateY(-1px); }
        .btn-success { background-color: var(--success); color: white; }
        .status-text { font-size: 14px; color: var(--text-muted); }
        
        /* 订阅卡片网格 */
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px; }
        .sub-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; text-align: center; transition: all 0.2s; background: #fafafa; }
        .sub-card:hover { border-color: var(--primary); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .sub-title { font-weight: bold; font-size: 16px; margin-bottom: 10px; display: inline-block; padding: 4px 12px; border-radius: 20px; color: white; }
        .sub-link { font-size: 12px; color: var(--text-muted); word-break: break-all; margin-bottom: 15px; user-select: all; }
        .sub-actions { display: flex; gap: 10px; justify-content: center; }
        .btn-outline { background: transparent; border: 1px solid #d1d5db; color: var(--text-main); font-size: 12px; padding: 6px 12px; }
        .btn-outline:hover { background: #e5e7eb; }

        /* 弹窗样式 */
        #toast { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); color: white; padding: 10px 20px; border-radius: 20px; font-size: 14px; opacity: 0; pointer-events: none; transition: opacity 0.3s; z-index: 1000; }
        
        /* 隐藏区块 */
        .guest-section { display: none; margin-top: 20px; padding-top: 20px; border-top: 1px dashed #e5e7eb; }
        .toggle-guest { color: var(--primary); cursor: pointer; font-size: 14px; text-align: center; margin-top: 15px; font-weight: bold; }
        .toggle-guest:hover { text-decoration: underline; }

        /* QR Code Modal */
        .modal { display: none; position: fixed; z-index: 100; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); align-items: center; justify-content: center; }
        .modal-content { background-color: white; padding: 20px; border-radius: 12px; text-align: center; max-width: 300px; position: relative; }
        .close { position: absolute; top: 10px; right: 15px; color: #aaa; font-size: 24px; font-weight: bold; cursor: pointer; }
        .close:hover { color: black; }
        #qrcode_canvas { display: flex; justify-content: center; margin-top: 15px; }

    </style>
    <script src="https://cdn.jsdelivr.net/npm/@keeex/qrcodejs-kx@1.0.2/qrcode.min.js"></script>
</head>
<body>

<div id="toast">操作成功</div>

<div id="qrModal" class="modal">
    <div class="modal-content">
        <span class="close" onclick="closeModal()">&times;</span>
        <h3 style="margin-top:0;">扫码订阅</h3>
        <div id="qrcode_canvas"></div>
    </div>
</div>

<div class="container">
    <div class="header">
        <h1>⚡️ ${FileName} 控制台</h1>
        <div style="font-size:12px; color:#888;">后端版本: CF-Workers-SUB</div>
    </div>

    <div class="card">
        <h2 class="card-title">📝 节点与订阅汇聚源</h2>
        ${hasKV ? `
        <div class="editor-wrapper">
            <textarea id="content" class="editor" placeholder="每行输入一个节点链接或订阅链接...&#10;例如:&#10;vless://...&#10;https://.../sub" spellcheck="false">${content}</textarea>
        </div>
        <div class="action-bar">
            <span class="status-text" id="saveStatus">就绪</span>
            <button class="btn btn-primary" id="saveBtn" onclick="saveContent(this)">💾 保存配置</button>
        </div>
        ` : '<p style="color:red; text-align:center;">⚠️ 请先绑定名称为 <strong>KV</strong> 的命名空间</p>'}
    </div>

    <div class="card">
        <h2 class="card-title">🔗 主订阅地址 (管理員)</h2>
        <div class="grid">
            ${subLinks.map((item, index) => `
            <div class="sub-card">
                <div class="sub-title" style="background-color: ${item.color}">${item.name}</div>
                <div class="sub-link">https://${url.hostname}/${mytoken}${item.path}</div>
                <div class="sub-actions">
                    <button class="btn btn-outline" onclick="copyText('https://${url.hostname}/${mytoken}${item.path}')">复制链接</button>
                    <button class="btn btn-outline" onclick="showQR('https://${url.hostname}/${mytoken}${item.path}')">二维码</button>
                </div>
            </div>
            `).join('')}
        </div>

        <div class="toggle-guest" onclick="toggleGuest()">[ 查看访客专用订阅配置 ]</div>
        
        <div id="guestSection" class="guest-section">
            <h2 class="card-title" style="border-bottom:none; margin-bottom:5px;">👤 访客专用地址</h2>
            <p style="font-size:13px; color:#888; margin-bottom:15px;">访客仅能获取订阅节点，无法进入此控制台。Token: <code style="background:#eee;padding:2px 4px;border-radius:4px;">${guest}</code></p>
            <div class="grid">
                ${subLinks.map((item, index) => `
                <div class="sub-card">
                    <div class="sub-title" style="background-color: ${item.color}">${item.name}</div>
                    <div class="sub-link">https://${url.hostname}/sub?token=${guest}${item.path.replace('?', '&')}</div>
                    <div class="sub-actions">
                        <button class="btn btn-outline" onclick="copyText('https://${url.hostname}/sub?token=${guest}${item.path.replace('?', '&')}')">复制链接</button>
                        <button class="btn btn-outline" onclick="showQR('https://${url.hostname}/sub?token=${guest}${item.path.replace('?', '&')}')">二维码</button>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </div>
</div>

<script>
    // Toast 通知
    function showToast(msg) {
        const toast = document.getElementById('toast');
        toast.textContent = msg;
        toast.style.opacity = 1;
        setTimeout(() => toast.style.opacity = 0, 2000);
    }

    // 复制功能
    function copyText(text) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('✅ 链接已复制到剪贴板');
        }).catch(err => {
            alert('复制失败，请手动复制');
        });
    }

    // 二维码功能
    let qrObj = null;
    function showQR(text) {
        document.getElementById('qrModal').style.display = 'flex';
        const qrContainer = document.getElementById('qrcode_canvas');
        qrContainer.innerHTML = '';
        qrObj = new QRCode(qrContainer, {
            text: text,
            width: 200,
            height: 200,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.M
        });
    }
    function closeModal() {
        document.getElementById('qrModal').style.display = 'none';
    }
    window.onclick = function(event) {
        const modal = document.getElementById('qrModal');
        if (event.target == modal) closeModal();
    }

    // 访客区显示切换
    function toggleGuest() {
        const el = document.getElementById('guestSection');
        if (el.style.display === 'block') {
            el.style.display = 'none';
        } else {
            el.style.display = 'block';
        }
    }

    // 自动保存逻辑
    if (document.querySelector('.editor')) {
        let timer;
        const textarea = document.getElementById('content');
        const btn = document.getElementById('saveBtn');
        const status = document.getElementById('saveStatus');

        function replaceFullwidthColon() {
            if (!/iPad|iPhone|iPod/.test(navigator.userAgent)) {
                textarea.value = textarea.value.replace(/：/g, ':');
            }
        }

        function saveContent(buttonElement) {
            replaceFullwidthColon();
            const newContent = textarea.value;
            
            buttonElement.textContent = '保存中...';
            buttonElement.disabled = true;
            status.textContent = '正在同步至云端...';

            fetch(window.location.href, {
                method: 'POST',
                body: newContent,
                headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
                cache: 'no-cache'
            })
            .then(response => {
                if (!response.ok) throw new Error('HTTP ' + response.status);
                const time = new Date().toLocaleTimeString();
                status.textContent = '✅ 云端已同步 (' + time + ')';
                buttonElement.className = 'btn btn-success';
                buttonElement.textContent = '已保存';
                showToast('✅ 配置已成功保存');
            })
            .catch(error => {
                status.textContent = '❌ 保存失败: ' + error.message;
                buttonElement.className = 'btn btn-primary';
                buttonElement.textContent = '重新保存';
                showToast('❌ 保存失败');
            })
            .finally(() => {
                setTimeout(() => {
                    buttonElement.className = 'btn btn-primary';
                    buttonElement.textContent = '💾 保存配置';
                    buttonElement.disabled = false;
                }, 2000);
            });
        }

        textarea.addEventListener('input', () => {
            status.textContent = '📝 内容已修改，等待保存...';
            clearTimeout(timer);
            timer = setTimeout(() => saveContent(btn), 3000); // 打字停顿3秒自动保存
        });
    }
</script>
</body>
</html>
		`;

		return new Response(html, {
			headers: { "Content-Type": "text/html;charset=utf-8" }
		});
	} catch (error) {
		console.error('处理请求时发生错误:', error);
		return new Response("服务器错误: " + error.message, {
			status: 500,
			headers: { "Content-Type": "text/plain;charset=utf-8" }
		});
	}
}
