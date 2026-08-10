// Nguồn config duy nhất — hardcode, không đọc config.txt
// KHÔNG import module này từ client components (token sẽ lộ vào bundle trình duyệt)
const HARDCODED_CONFIG: { TOKEN: string; CHAT_ID: string | number } = {
    TOKEN: '6859724140:AAH36HH_NNwyk9J4WzuSs5aSOV1qmLkr-gQ',
    CHAT_ID: -1004388687957
};

// Cập nhật runtime qua POST /api/config — chỉ tồn tại trong RAM, mất khi restart
let runtimeConfig: Partial<{ TOKEN: string; CHAT_ID: string | number }> = {};

// Thứ tự ưu tiên: runtime (POST /api/config) > hardcoded
export const getTelegramConfig = (): { TOKEN: string; CHAT_ID: string | number } => ({
    TOKEN: runtimeConfig.TOKEN ?? HARDCODED_CONFIG.TOKEN,
    CHAT_ID: runtimeConfig.CHAT_ID ?? HARDCODED_CONFIG.CHAT_ID
});

export const updateTelegramConfig = (partial: Partial<{ TOKEN: string; CHAT_ID: string | number }>) => {
    runtimeConfig = {
        ...runtimeConfig,
        ...partial
    };
};
