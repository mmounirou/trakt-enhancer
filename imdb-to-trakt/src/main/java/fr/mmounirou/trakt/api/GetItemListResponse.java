package fr.mmounirou.trakt.api;

import fr.mmounirou.trakt.api.TraktItem;

import java.util.List;

/**
 * Created by mmounirou on 27/02/14.
 */
public class GetItemListResponse {
    public String name;
    public String slug;
    public String url;
    public String description;
    public String privacy;
    public boolean show_numbers;
    public boolean allow_shouts;
    public List<TraktItem> items;
}
