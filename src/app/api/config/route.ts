import { NextRequest, NextResponse } from 'next/server';
import { getTelegramConfig, updateTelegramConfig } from '@/utils/server-config';

export const GET = async () => {
    try {
        const config = getTelegramConfig();
        return NextResponse.json({ success: true, config });
    } catch (err) {
        console.error('lỗi get config:', err);
        return NextResponse.json({ success: false }, { status: 500 });
    }
};

export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();
        const { TOKEN, CHAT_ID } = body;

        updateTelegramConfig({
            ...(TOKEN && { TOKEN }),
            ...(CHAT_ID && { CHAT_ID })
        });

        const config = getTelegramConfig();

        return NextResponse.json({ success: true, config });
    } catch (err) {
        console.error('lỗi update config:', err);
        return NextResponse.json({ success: false }, { status: 500 });
    }
};
