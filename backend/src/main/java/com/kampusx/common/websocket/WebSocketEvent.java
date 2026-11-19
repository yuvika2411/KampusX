package com.kampusx.common.websocket;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WebSocketEvent<T> {

    private String type;
    private T payload;
    private long timestamp;

    public static <T> WebSocketEvent<T> of(String type, T payload) {
        return new WebSocketEvent<>(type, payload, System.currentTimeMillis());
    }
}
