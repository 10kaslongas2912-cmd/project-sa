import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import './style.css';
import AnimatedNumber from '../../../components/AnimatedNumber';
import dog from "../../../assets/dog.png";
import vaccine from "../../../assets/vaccine.png";
import treatment from "../../../assets/treat.png";
import shelter from "../../../assets/shelter.png";
import adoption from "../../../assets/adopt.png";

const carouselImages = [
    'https://longwoodvetcenter.com/wp-content/uploads/2023/05/Animal-Shelters-in-Pennsylvania.jpg',
    'https://media.4-paws.org/4/8/2/0/4820f570a119f3e8bd1b6db470d0c6a65445dcf1/VIER_PFOTEN_2023-02-15_00002-2895x2004-1300x900.jpg?_jtsuid=22804175291243065431299',
    'https://media.4-paws.org/6/8/9/3/689354d6694789b45569cd647a6009e240b4afe7/VIER%20PFOTEN_2016-09-18_081-1927x1333-1920x1328.jpg',
];

function FirstPage() {

    return (
        <div className="main-container">
            <Carousel
                autoPlay={true}
                infiniteLoop={true}
                showThumbs={false}
                showStatus={false}
                interval={4000}
                transitionTime={600}
                stopOnHover={true}
                className="header-carousel"
            >
                {carouselImages.map((imageSrc, index) => (
                    <img key={index} src={imageSrc} alt={`Slide ${index + 1}`} />
                ))}
            </Carousel>
            <div className='advice'>
                <h1>OUR MISSION</h1>
                <p>Dog Care is a non-profit organization whose main purpose is to give the stray dogs in our area a better life and to diminish the number of suffering stray dogs.</p>
                <div className='advice-items'>
                    <div className='feed'>
                        <img src="https://imgs.search.brave.com/neOREJJiy5S_Qo7N8RNaJip8k4EzV6RhBJLINS6OYuE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTI4/MDg2OTA3Mi9waG90/by90d28tZG9ncy1l/YXRpbmctdG9nZXRo/ZXItZnJvbS10aGVp/ci1mb29kLWJvd2xz/LmpwZz9zPTYxMng2/MTImdz0wJms9MjAm/Yz1wcEpPYi1ycEFu/Yk1TdzJvZU93VXhH/OEM1YndMS0JwV3lt/YzNHM2FqOUdVPQ" alt="feed" />
                        <h4>FEEDING & CARING</h4>
                        <p>Every day the stray dogs living in the streets of our area get fed and looked after. This is the best way to gain the dog’s trust and socialize them in order to treat them if they are sick and to neuter them. By keeping the dogs fed and healthy we also keep them calm and avoid they will be a threat to humans. Only a dog that is starving, scared or hurt will attack a human so this is a good way to let us coexist. We currently take care of 300(+) street dogs.</p>
                    </div>
                    <div className='shelter'>
                        <img src="https://imgs.search.brave.com/fxnh-draB3h1r-TgIqvg0LX8YuDKJXx2VDSiOyPJhh0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly92ZXRl/cmluYXJ5YXJjaGl0/ZWN0dXJldW5sZWFz/aGVkLmNvbS93cC1j/b250ZW50L3VwbG9h/ZHMvcGhvdG8tZ2Fs/bGVyeS9pbXBvcnRl/ZF9mcm9tX21lZGlh/X2xpYnJheS90aHVt/Yi9IdW1hbmUtb2Yt/Q2hhcmxvdHRlLTkw/MHg2MDAxMS0xLmpw/Zz9id2c9MTcwMjA3/Mjg2OA" alt="shelter" />
                        <h4>DOG SHELTER</h4>
                        <p>In the shelter, we treat dogs for injuries and diseases, both long term and short term treatments. The number of neglected and abandoned dogs outside keep increasing, also puppies left without mothers that we must bring to shelter if they are to survive. Some of the dogs that got treatment in the shelter can go back to the streets but not all. That is why we have many dogs now in the shelter. We need adopters and sponsors for these ~300 dogs.</p>
                    </div>
                    <div className='spay'>
                        <img src="https://imgs.search.brave.com/PrFJzpE8oW4Dv1TniJ4O0rUoBb1MPa_o7sN9zGfNWNc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/YXNwY2Fwcm8ub3Jn/L3NpdGVzL2RlZmF1/bHQvZmlsZXMvc3R5/bGVzL2ltYWdlX2Nh/cmRfdmVydGljYWwv/cHVibGljLzIwMjMt/MDUvYXNuYV9zdXJn/ZXJ5X2F2bF9mZWIy/MDIxLTAwMDEuanBn/LndlYnA_aXRvaz1W/UGZUeEhqeA" alt="spay" />
                        <h4>SPAY & NEUTER</h4>
                        <p>The most effective way to reduce the stray dog population is through neutering males and spaying females. We arrange campaigns offering locals to get their animals fixed for a reduced price, and we also use the TNR method (Trap Neuter Return) to prevent the population of stray dogs from increasing. This means that we trap the dogs using a stun gun, neuter and vaccinate them, and return them to their area where they feel safe. Currently around 450 per year.</p>
                    </div>
                    <div className='rehome'>
                        <img src="https://imgs.search.brave.com/p4Ml71Hag-AGS71WgDKmBOIjTmtTSDUrRrMh144FayI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9nZC1w/cm9kLmF6dXJlZWRn/ZS5uZXQvLS9tZWRp/YS9wcm9qZWN0L2d1/aWRlZG9ncy9ndWlk/ZWRvZ3Nkb3Rvcmcv/aW1hZ2VzL2hvdy15/b3UtY2FuLWhlbHAv/cmVob21pbmcvcmVo/b21pbmctLWFuLW9s/ZGVyLWRvZy5qcGc_/aD00NDEmYW1wO3c9/Nzg0JmFtcDs" alt="rehome" />
                        <h4>REHOME</h4>
                        <p>Every dog deserves a loving home! We have around 300 dogs at our shelter that either yearn for a family to adopt them or who need a sponsor to pay for their stay at the shelter. Just scroll down and click ADOPT A DOG or SPONSOR A DOG. We are in the process of updating these lists, please bear with us. If you already have a wish in mind, about how your ideal dog should be, just contact us and we will come back to you with a suggestion. Currently we adopt out around 50 dogs per year, mainly in Thailand and a few to Europe. Unfortunately since Covid people are not so interested anymore in adopting from abroad. But we can assure you it is possible and we have good experience with it.</p>
                    </div>
                </div>
                <a href="#" className='action-link'>TAKE ACTION TO SAVE LIVES AND BRING HOPE FOR STREET DOGS IN NEED</a>
            </div>
            <div className='content'>
                <img src="https://imgs.search.brave.com/Ut0yXavhm_4br42Lv3nJInSNie2Gmq4ypQps-mxuSxU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTAz/NDYxMzAxMi9waG90/by9naXJsLWh1Z2dp/bmctaGVyLWRvZy5q/cGc_cz02MTJ4NjEy/Jnc9MCZrPTIwJmM9/MWo0TmtLRlVBTWtf/UlI0R1kwT0dMTUFR/ZkNmSVJqRHNMMm1V/U1drYzM1az0" alt="dog" />
                <div className="cover">
                    <h1 className='text'>Our 2024 Work By the Numbers</h1>
                    <img className='golden-retriever' src={dog} alt="golden" />
                    <div className="stats-container">
                        <div className="stat-group left">
                            <div className="stat-item">
                                <img src={vaccine} alt="Vaccine" className="stat-iconV" />
                                <p>Animals neutered and vaccinated</p>
                                <h4><AnimatedNumber finalNumber={4891} /></h4>
                            </div>
                            <div className="stat-item">
                                <img src={treatment} alt="Treatment" className="stat-iconT" />
                                <p>Sick and injured animals treated</p>
                                <h4><AnimatedNumber finalNumber={3256} /></h4>
                            </div>
                        </div>
                        <div className="stat-group right">
                            <div className="stat-item">
                                <img src={shelter} alt="Shelter" className="stat-iconS" />
                                <p>New animals provided with shelter</p>
                                <h4><AnimatedNumber finalNumber={1823} /></h4>
                            </div>
                            <div className="stat-item">
                                <img src={adoption} alt="Adoption" className="stat-iconA" />
                                <p>Animals adopted to new homes</p>
                                <h4><AnimatedNumber finalNumber={1598} /></h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FirstPage;