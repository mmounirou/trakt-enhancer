package fr.mmounirou;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import fr.mmounirou.trakt.api.GetItemListResponse;
import fr.mmounirou.trakt.api.TraktItem;
import fr.mmounirou.trakt.api.TraktListService;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import retrofit.RestAdapter;

public class Main {

	public static void main(String[] args) throws IOException {

        RestAdapter restAdapter = new RestAdapter
                .Builder()
                .setEndpoint("http://api.trakt.tv/")
                .build();

        TraktListService service = restAdapter.create(TraktListService.class);
        String apiKey = "3f54d682c5c02ac47c0d0db1a5db35c1";
        String username = "mmounirou";
        String slug = "test-list";

        //GetItemListResponse items = service.getItems(apiKey, username, slug);
        //System.out.println(items);

        TraktItem item;
        service.addItems(apiKey,username,password,slug, Arrays.asList(item));

/*
        final int minimumVotes = 15000;
		String searchUrl = "http://www.imdb.com/search/title?count=250&num_votes="+minimumVotes+",&release_date=2013,2013&sort=user_rating,desc&title_type=feature&view=simple";
        final List<ImdbSearchResult> imdbResultSortedByWeight = getImdbResultSortedByWeight(minimumVotes, searchUrl);
*/


    }

    private static List<ImdbSearchResult> getImdbResultSortedByWeight(int minimumVotes, String searchUrl) throws IOException {
        Document document = Jsoup.connect(searchUrl).userAgent("Chrome/33.0.1750.117").get();
        List<ImdbSearchResult> imdbResults = document
                .select(".results")
                .select("tr.odd,tr.even")
                .stream()
                        //.peek(e -> System.out.println(e))
                .map(elmt -> {
                    String title = elmt.select("td a").text();
                    String imdbId = elmt.select("td a").attr("href").split("/")[2];
                    String rating = elmt.select("b").text();
                    String votes = elmt.select("td").last().text().replace(",", ".");

                    return new ImdbSearchResult(title, rating, imdbId, votes);
                })
                .collect(Collectors.toList());

        double averageRating = imdbResults
                .stream()
                .mapToDouble(res -> res.getRating())
                .average()
                .getAsDouble();

        return imdbResults
                .stream()
                .map(x -> {
                    x.weightedRating(averageRating, minimumVotes);
                    return x;
                })
                .sorted((y, x) -> x.getWeightedRating().compareTo(y.getWeightedRating()))
                        //.peek(x -> System.out.println(x.getImdbid() + " - " + x.getTitle() + " - " + x.getRating() + " - "+ x.getWeightedRating() + " - " + x.getVotes()))
                .collect(Collectors.toList());
    }
}
