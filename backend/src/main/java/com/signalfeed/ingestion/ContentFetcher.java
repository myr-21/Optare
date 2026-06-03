package com.signalfeed.ingestion;

import com.signalfeed.model.ContentItem;
import java.util.List;

public interface ContentFetcher {
    List<ContentItem> fetch();
    String getSource();
}
