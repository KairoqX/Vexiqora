// HTTP status code reference. Descriptions are short summaries written for this site.

export type StatusClass = "1xx" | "2xx" | "3xx" | "4xx" | "5xx";

export interface HttpStatus {
  code: number;
  name: string;
  description: string;
}

export const statusClassNames: Record<StatusClass, string> = {
  "1xx": "Informational",
  "2xx": "Success",
  "3xx": "Redirection",
  "4xx": "Client error",
  "5xx": "Server error",
};

export const statusClasses = Object.keys(statusClassNames) as StatusClass[];

export const httpStatuses: HttpStatus[] = [
  { code: 100, name: "Continue", description: "The request headers were accepted. The client should go ahead and send the body." },
  { code: 101, name: "Switching Protocols", description: "The server agrees to switch to the protocol the client asked for, such as WebSocket." },
  { code: 102, name: "Processing", description: "The server is still working on the request and has no final response yet (WebDAV)." },
  { code: 103, name: "Early Hints", description: "Sent before the final response so the browser can start loading resources early." },
  { code: 200, name: "OK", description: "The request succeeded. What the response contains depends on the request method." },
  { code: 201, name: "Created", description: "The request succeeded and a new resource was created, usually after a POST or PUT." },
  { code: 202, name: "Accepted", description: "The request was received but processing is not finished. The result may come later." },
  { code: 203, name: "Non-Authoritative Information", description: "The response was modified by a proxy and may differ from the origin server’s." },
  { code: 204, name: "No Content", description: "The request succeeded and there is intentionally no response body." },
  { code: 205, name: "Reset Content", description: "The request succeeded. The client should reset the view that sent it, such as a form." },
  { code: 206, name: "Partial Content", description: "Only the byte range that was requested is returned, used for resumable downloads and video." },
  { code: 207, name: "Multi-Status", description: "The body contains separate status codes for several operations (WebDAV)." },
  { code: 208, name: "Already Reported", description: "Members of a WebDAV binding were already listed earlier in the response." },
  { code: 226, name: "IM Used", description: "The response is the result of one or more instance manipulations applied to the resource." },
  { code: 300, name: "Multiple Choices", description: "There are several possible responses and the client may pick one." },
  { code: 301, name: "Moved Permanently", description: "The resource has a new permanent URL. Clients and search engines should use the new one." },
  { code: 302, name: "Found", description: "The resource is temporarily at another URL. Keep using the original URL in future." },
  { code: 303, name: "See Other", description: "Fetch the result from another URL using GET, often after a form submission." },
  { code: 304, name: "Not Modified", description: "The cached copy is still valid, so no body is sent." },
  { code: 305, name: "Use Proxy", description: "Deprecated. The resource must be accessed through a proxy." },
  { code: 307, name: "Temporary Redirect", description: "Temporarily use another URL and repeat the same method and body." },
  { code: 308, name: "Permanent Redirect", description: "Permanently use another URL and repeat the same method and body." },
  { code: 400, name: "Bad Request", description: "The server can’t process the request because it is malformed or invalid." },
  { code: 401, name: "Unauthorized", description: "Authentication is required or has failed. The client has not proven who it is." },
  { code: 402, name: "Payment Required", description: "Reserved for future use. Some services use it to signal a payment problem." },
  { code: 403, name: "Forbidden", description: "The server understood the request but refuses it. Logging in again won’t help." },
  { code: 404, name: "Not Found", description: "Nothing exists at this URL. The server won’t say whether it ever did." },
  { code: 405, name: "Method Not Allowed", description: "The HTTP method isn’t supported for this URL, for example POST to a read-only page." },
  { code: 406, name: "Not Acceptable", description: "The server can’t produce a response matching the client’s Accept headers." },
  { code: 407, name: "Proxy Authentication Required", description: "Like 401, but the client must first authenticate with the proxy." },
  { code: 408, name: "Request Timeout", description: "The server gave up waiting for the client to finish sending the request." },
  { code: 409, name: "Conflict", description: "The request conflicts with the current state of the resource, such as an edit collision." },
  { code: 410, name: "Gone", description: "The resource was deliberately removed and won’t come back." },
  { code: 411, name: "Length Required", description: "The server requires a Content-Length header on the request." },
  { code: 412, name: "Precondition Failed", description: "A condition in the request headers, such as If-Match, was not met." },
  { code: 413, name: "Content Too Large", description: "The request body is bigger than the server allows (formerly Payload Too Large)." },
  { code: 414, name: "URI Too Long", description: "The URL is longer than the server is willing to handle." },
  { code: 415, name: "Unsupported Media Type", description: "The server doesn’t support the format of the request body." },
  { code: 416, name: "Range Not Satisfiable", description: "The requested byte range falls outside the size of the resource." },
  { code: 417, name: "Expectation Failed", description: "The server can’t meet the requirement in the Expect header." },
  { code: 418, name: "I’m a teapot", description: "A joke code from an April Fools’ RFC. A teapot refuses to brew coffee." },
  { code: 421, name: "Misdirected Request", description: "The request was sent to a server that can’t produce a response for that address." },
  { code: 422, name: "Unprocessable Content", description: "The request is well-formed but its content failed validation. Common in APIs." },
  { code: 423, name: "Locked", description: "The resource is locked (WebDAV)." },
  { code: 424, name: "Failed Dependency", description: "The request failed because an earlier request it depended on failed (WebDAV)." },
  { code: 425, name: "Too Early", description: "The server won’t process a request that might be replayed." },
  { code: 426, name: "Upgrade Required", description: "The client must switch to a different protocol, such as TLS, to continue." },
  { code: 428, name: "Precondition Required", description: "The server requires the request to be conditional, to prevent lost updates." },
  { code: 429, name: "Too Many Requests", description: "The client sent too many requests in a given time (rate limiting)." },
  { code: 431, name: "Request Header Fields Too Large", description: "The request headers are too big, as a whole or individually." },
  { code: 451, name: "Unavailable For Legal Reasons", description: "Access is denied for legal reasons, such as a court order." },
  { code: 500, name: "Internal Server Error", description: "A generic error: the server hit an unexpected problem it can’t describe more precisely." },
  { code: 501, name: "Not Implemented", description: "The server doesn’t support the functionality needed for this request." },
  { code: 502, name: "Bad Gateway", description: "A gateway or proxy received an invalid response from the server behind it." },
  { code: 503, name: "Service Unavailable", description: "The server is temporarily overloaded or down for maintenance." },
  { code: 504, name: "Gateway Timeout", description: "A gateway or proxy didn’t get a response from the upstream server in time." },
  { code: 505, name: "HTTP Version Not Supported", description: "The server doesn’t support the HTTP version used in the request." },
  { code: 506, name: "Variant Also Negotiates", description: "A server configuration error in content negotiation." },
  { code: 507, name: "Insufficient Storage", description: "The server has no room to store what the request needs (WebDAV)." },
  { code: 508, name: "Loop Detected", description: "The server found an infinite loop while processing the request (WebDAV)." },
  { code: 510, name: "Not Extended", description: "The request needs further extensions for the server to fulfil it." },
  { code: 511, name: "Network Authentication Required", description: "The client must authenticate to gain network access, as on a captive Wi-Fi portal." },
];

export function classOf(code: number): StatusClass {
  return `${Math.floor(code / 100)}xx` as StatusClass;
}

/** Filters by a class (such as "4xx") and a search that matches the code, name or description. */
export function filterStatuses(list: HttpStatus[], query: string, statusClass: StatusClass | "all"): HttpStatus[] {
  const needle = query.trim().toLowerCase();
  return list.filter((s) => {
    if (statusClass !== "all" && classOf(s.code) !== statusClass) return false;
    if (needle === "") return true;
    return `${s.code} ${s.name} ${s.description}`.toLowerCase().includes(needle);
  });
}
