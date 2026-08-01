<?php
/**
 * lib/claude.php — Shared helper for calling the Anthropic Claude API.
 * Used by: dream-interpretation.php (inline copy), ai-explain-prediction.php,
 *          ai-summarize-stats.php, ai-chat.php, ai-betting-insights.php
 */

/**
 * Call Claude with a system prompt + messages array.
 * Returns the raw text of Claude's first text content block.
 * Throws Exception on transport/API error or missing key.
 *
 * @param string $systemPrompt
 * @param array  $messages     [{role: 'user'|'assistant', content: string}, ...]
 * @param int    $maxTokens
 * @param string $model
 * @return string
 */
function callClaudeText(string $systemPrompt, array $messages, int $maxTokens = 1024, string $model = 'claude-haiku-4-5'): string
{
    if (empty(ANTHROPIC_API_KEY) || str_starts_with(ANTHROPIC_API_KEY, 'sk-ant-api03-xxx')) {
        throw new Exception('Anthropic API key ຍັງບໍ່ໄດ້ຕັ້ງຄ່າ. ໃສ່ key ໃນ api/.env');
    }

    $requestData = [
        'model'      => $model,
        'max_tokens' => $maxTokens,
        'system'     => $systemPrompt,
        'messages'   => $messages,
    ];

    $ch = curl_init('https://api.anthropic.com/v1/messages');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($requestData),
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'x-api-key: ' . ANTHROPIC_API_KEY,
            'anthropic-version: 2023-06-01',
        ],
        CURLOPT_TIMEOUT => 30,
    ]);

    $response  = curl_exec($ch);
    $httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        throw new Exception('ບໍ່ສາມາດເຊື່ອມຕໍ່ AI ໄດ້: ' . $curlError);
    }

    $data = json_decode($response, true);

    if ($httpCode !== 200) {
        $errMsg = $data['error']['message'] ?? 'ຜິດພາດ API';
        throw new Exception('Claude API error: ' . $errMsg);
    }

    $text = '';
    foreach ($data['content'] as $block) {
        if ($block['type'] === 'text') {
            $text = $block['text'];
            break;
        }
    }
    return trim($text);
}

/** Strip markdown code fences that Claude sometimes wraps JSON in. */
function stripJsonFences(string $text): string
{
    $text = preg_replace('/^```(?:json)?\s*/m', '', $text);
    $text = preg_replace('/\s*```$/m', '', $text);
    return trim($text);
}
