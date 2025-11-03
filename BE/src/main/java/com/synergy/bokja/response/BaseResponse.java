package com.synergy.bokja.response;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@JsonPropertyOrder({"header", "body"})
public class BaseResponse<T> {

    private Header header;
    private T body;

    public BaseResponse(int resultCode, String resultMsg, T body) {
        this.header = new Header(resultCode, resultMsg);
        this.body = body;
    }

    @Getter
    @AllArgsConstructor
    static class Header {
        private int resultCode;
        private String resultMsg;
    }
}
