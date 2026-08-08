import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { getTelegramConfig } from '@/utils/server-config';

const POST = async (req: NextRequest) => {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    console.log(`[${requestId}] Incoming request:`, {
        timestamp: new Date().toISOString(),
        ip: clientIp,
        userAgent
    });

    try {
        const body = await req.json();
        const { message, message_id } = body;

        console.log(`[${requestId}] Request body:`, {
            messageLength: message?.length || 0,
            messagePreview: message?.substring(0, 100) || 'N/A',
            message_id
        });

        if (!message) {
            console.error(`[${requestId}] Missing message`);
            return NextResponse.json({ success: false }, { status: 400 });
        }

        const { TOKEN, CHAT_ID } = getTelegramConfig();

        console.log(`[${requestId}] Config loaded:`, {
            hasToken: !!TOKEN,
            hasChatId: !!CHAT_ID,
            chatId: CHAT_ID ? `${String(CHAT_ID).substring(0, 3)}...` : 'N/A'
        });

        if (!TOKEN || !CHAT_ID) {
            console.error(`[${requestId}] Missing config:`, { hasToken: !!TOKEN, hasChatId: !!CHAT_ID });
            return NextResponse.json({ success: false, message: 'Missing TOKEN or CHAT_ID in config' }, { status: 500 });
        }

        const isEdit = !!message_id;

        // [DELETE + SEND] Nếu có message_id: xoá tin cũ trước, rồi gửi tin mới (không dùng edit)
        if (isEdit) {
            try {
                await axios.post(
                    `https://api.telegram.org/bot${TOKEN}/deleteMessage`,
                    {
                        chat_id: CHAT_ID,
                        message_id: message_id
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        timeout: 30000
                    }
                );
            } catch (deleteError) {
                // Best-effort: xoá lỗi thì vẫn tiếp tục gửi tin mới
                console.error(`[${requestId}] Delete old message failed (continuing):`, {
                    error:
                        deleteError instanceof Error
                            ? deleteError.message
                            : 'Unknown error',
                    message_id
                });
            }
        }

        const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

        const payload = {
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        };

        console.log(`[${requestId}] Sending to Telegram:`, {
            endpoint: 'sendMessage',
            deletedOldMessage: isEdit,
            payloadSize: JSON.stringify(payload).length
        });

        const response = await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });

        const result = response.data?.result;

        const duration = Date.now() - startTime;
        console.log(`[${requestId}] Request completed:`, {
            success: true,
            statusCode: response.status,
            returnedMessageId: result?.message_id ?? null,
            duration: `${duration}ms`
        });

        return NextResponse.json({
            success: true,
            message_id: result?.message_id ?? null
        });
    } catch (error) {
        const duration = Date.now() - startTime;
        const isAxiosError = axios.isAxiosError(error);

        console.error(`[${requestId}] Request failed:`, {
            error: isAxiosError
                ? {
                      message: error.message,
                      code: error.code,
                      status: error.response?.status,
                      statusText: error.response?.statusText
                  }
                : error instanceof Error
                  ? error.message
                  : 'Unknown error',
            duration: `${duration}ms`
        });

        return NextResponse.json(
            {
                success: false,
                error: isAxiosError ? error.message : 'Internal server error'
            },
            { status: isAxiosError && error.response?.status ? error.response.status : 500 }
        );
    }
};

export { POST };
