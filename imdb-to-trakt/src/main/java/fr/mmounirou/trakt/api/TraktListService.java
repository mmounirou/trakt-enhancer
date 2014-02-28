package fr.mmounirou.trakt.api;

import retrofit.http.GET;
import retrofit.http.POST;
import retrofit.http.Path;

import java.util.List;

/**
 * Created by mmounirou on 27/02/14.
 */
public interface TraktListService {

    @POST("/lists/items/add/{apikey}")
    public void addItems(@Path("apikey") String apiKey,String username,String password,String slug,List<TraktItem> items);

    @GET("/user/list.json/{apikey}/{username}/{slug}")
    public GetItemListResponse getItems(@Path("apikey") String apiKey,@Path("username") String username,@Path("slug") String slug);
}
