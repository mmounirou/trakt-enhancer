package fr.mmounirou;

public class ImdbSearchResult {

	private final String title;
    private final double note;
    private final double votes;
    private final String imdbid;
    private double weightedRating;

    public ImdbSearchResult(String title, String rating, String imdbId, String votes) {
        this.title = title;
        this.imdbid = imdbId;
        this.note = parseDouble(rating,-1);
        this.votes = parseDouble(votes,-1);
    }

    private double parseDouble(String strVal, double defaultValue) {
        try {
            return Double.parseDouble(strVal);

        }catch (NumberFormatException e){
            return  defaultValue;
        }
    }

    public String getTitle() {
		return title;
	}

    public double getRating() {
        return note;
    }

    public double getVotes() {
        return votes;
    }

    public String getImdbid() {
        return imdbid;
    }

    public void weightedRating(double averageRating, int minimumVotes) {
        this.weightedRating = (getVotes() / (getVotes()+minimumVotes)) * getRating() + (minimumVotes / (getVotes() + minimumVotes)) * averageRating;
    }

    public Double getWeightedRating() {
        return weightedRating;
    }
}
