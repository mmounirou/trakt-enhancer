package fr.mmounirou.trakt.api;

import java.util.List;

/**
 * Created by mmounirou on 27/02/14.
 */
public class TraktMovie {
    public String title;
    public Integer year;
    public Integer released;
    public String url;
    public String trailer;
    public Integer runtime;
    public String tagline;
    public String overview;
    public String certification;
    public String imdb_id;
    public String tmdb_id;
    public TraktImages images;
    public TraktRatings ratings;
    public List<String> genres;
}
