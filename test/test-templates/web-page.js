let data = `__::start__
<div class="page page-landing">
	<section class="jumbo container-wrapper home-banner-picture-background">
		__::inner-header__
		<div class="msg">
			<div class="inner">
				<h2>Timeless Music for Everyone</h2>
				<h1>__::images/banner-logo__ Symphony Orchestra of </h1>
				<div class="actions">
					<a href="/concerts">Upcoming Events</a>

				</div>
			</div>
		</div>

	</section>
	<section class="">
		<div class="container small-town">
			<div class="msg">
				<div class="small">
					Small Town. <strong>Big Sound.</strong>
				</div>
				<div class="sub">
					Subscribe to our newsletter to stay informed.
				</div>

			</div>
			<div class="form">
				<form action="/subscribe" method="post">
					<div>
						<input type="email" name="email" placeholder="Enter your email">
					</div>
					<div>
						<button type="submit">
							Subscribe
						</button>
					</div>
				</form>
			</div>
		</div>
	</section>
	<main>
		<section class="container-wrapper">
			<div class="container season-update">
				<div class="msg edit-content-inline"><h1>SEASON <strong>UPDATE</strong></h1>

<p>We welcome you to a new season of concerts.</p>

<p>&nbsp;</p>
</div>
				<div class="cal">
				</div>
			</div>

		</section>
		<section class="upcoming-season coming-events-back-picture-background">
			<h1 class="top">Upcoming <strong>Season</strong></h1>
			
			<div class="strip pic-stripe">
				<div class="left">
					<a class="go-left">
						__::images/green-chevron-left__
					</a>
				</div>
				<div class="mid">
					<div class="stripe moveable">
						__events::event-preview-home__
					</div>
				</div>
				<div class="right ">
					<a class="go-right">
						__::images/green-chevron-right__
					</a>
					
				</div>
			</div>
			<div class="view-all">
				<a href="/concerts">View All</a>	
			</div>
		</section>
		<section class="container-wrapper">
			<div class="container piano">
				<h1>Introducing the newest member of the ASO: our beautiful new piano!</h1>
				__::images/piano-video__
			</div>
			<div class="container richard-larson">
				<img class="larson" src="/img/richard-larson.jpg" />
				<div class="txt edit-content-inline"><p>Richard Larson is being honored at the ASO’s May 1<sup>st</sup> Concert, “A Grand Celebration,” for his 60+ year career in community music, especially his years in  (1966 – 1982), where he served as coordinator of the music program in Public Schools and as artistic director and conductor of the ASO and Symphony Chorus. He holds a Bachelor of Arts Degree from Luther College, and a Master in Music Education degree from the University of Colorado.</p>

<p>Mr. Larson commented on his early background: “I came from a very poor home in a very small town. I grew up with no television, no books; I played pool in the pool hall and ping pong in the front of the gym. There had never been a kid in my family who went to college. I’ve always said I was the <em>least </em>likely to succeed. It was expected that I’d work on the farm or run the filling station. Then Weston Noble found me and I went to Luther College. I watched him conduct and thought, ‘This is what I want to do.’”</p>

<p>And conduct, he did!</p>

<p>He has served high schools as well as being an adjunct professor at the University of Colorado Boulder, the Lamont School of Music, University of Denver, the University of Northern Colorado, Metropolitan State College, and Central Connecticut State University. He has served as clinician at the Rene Clausen Choral School, the Iowa and South Dakota ACDA conferences, and conducted the Minnesota Men’s All-State Choir.</p>

<p>Although too numerous to mention, his choirs at all levels routinely received prestigious honors and invitations to perform at state, regional, and national conventions and events. He conducted the Cherry Creek Meistersingers, Symphonic Orchestra and Chamber Orchestra in the years 1982 to 1995, was named “Choral Conductor of the Year” in 1989 by the Colorado ACDA and in 2006 was honored by Luther College as the first ever recipient of the Weston H. Noble award recognizing excellence in the field of choral music.</p>

<p>He was the first conductor of the auditioned 52-voice “Kantorei,” a highly-acclaimed choral ensemble, still nationally recognized as one of the premier vocal groups in the country. During his tenure as conductor, from 1997 to 2013, the group performed by invitation at Chicago’s Orchestra Hall, New York’s Carnegie and Avery Fisher Halls, and the Vatican, among other prestigious venues.</p>

<p>In 2018, Mr. Larson was one of only two music educators chosen to be inducted into the Colorado Music Educators Association, one of the most distinguished awards to be presented to a Colorado Music teacher. He also taught graduate music education classes at the University of Colorado and served on the UC Alumni Board as the College of Music representative for three years.</p>

<p>Nancy Knowlton, her family, and the entire community recognize that Richard Larson’s skills and dedication helped bring  music to a new, higher level that is recognized state-wide and regionally. It is believed by many that it is a level that it still enjoys today. Thank you, Richard and congratulations on an exemplary career! Weston Noble must have known that you would make him very proud someday!</p>
</div>
				
			</div>
			
		</section>
		__::get-your-tickets__
		
		<section class="travels">
			<div class="left season-tickets-picture-background">
				<div class="inner">
					<h2>2021-2022 Season Tickets</h2>
					<div class="actions">
						<a href="/concerts">Reserve Your Seat</a>
					</div>	
				</div>
				
			</div>
			<div class="right support-local-picture-background">
				<div class="inner">
					<h2>Support Local Music</h2>
					<p>
						We’re small but mighty, and it’s thanks to enduring support from folks like you that we’re able to continue making excellent music.
					</p>
					<div class="actions">
						<a href="/support">Make the Music Happen</a>
					</div>	
				</div>
				
			</div>
			
		</section>
	</main>


	__::footer__
</div>
__::end__
`
module.exports = data