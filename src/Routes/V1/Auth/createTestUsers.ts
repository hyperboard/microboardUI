import * as Drizzle from "drizzle";
import * as bcrypt from "bcryptjs";
const funAnimalUsers = [
    { name: "Lenny Lion", email: "roaring.lenny@wildmail.com" },
    { name: "Ellie Elephant", email: "trunky.ellie@savannahnet.com" },
    { name: "Gerry Giraffe", email: "tallneck.gerry@spottedemail.com" },
    { name: "Polly Penguin", email: "chilly.polly@icymail.com" },
    { name: "Kangy Kangaroo", email: "hoppy.kangy@outbackmail.com" },
    { name: "Ollie Owl", email: "night.ollie@wisdomail.com" },
    { name: "Freddie Fox", email: "sly.freddie@forestmail.com" },
    { name: "Wally Walrus", email: "tusks.wally@arcticmail.com" },
    { name: "Ziggy Zebra", email: "stripy.ziggy@savannahnet.com" },
    { name: "Coco Crocodile", email: "snappy.coco@swampmail.com" },
    { name: "Hippie Hippo", email: "muddy.hippie@rivermail.com" },
    { name: "Manny Monkey", email: "cheeky.manny@junglemail.com" },
    { name: "Beary Bear", email: "grizzly.beary@forestmail.com" },
    { name: "Dolly Dolphin", email: "splashy.dolly@oceanmail.com" },
    { name: "Rhino Randy", email: "horny.randy@savannahnet.com" },
    { name: "Ozzy Ostrich", email: "sandy.ozzy@desertmail.com" },
    { name: "Koaly Koala", email: "sleepy.koaly@eucalyptusnet.com" },
    { name: "Peggy Pig", email: "muddy.peggy@farmmail.com" },
    { name: "Sheepy Sheep", email: "wooly.sheepy@meadowmail.com" },
    { name: "Ducky Duck", email: "quacky.ducky@pondmail.com" },
    { name: "Chicky Chicken", email: "clucky.chicky@barnmail.com" },
    { name: "Bunny Rabbit", email: "hoppy.bunny@burrowmail.com" },
    { name: "Fishy Fish", email: "bubbly.fishy@aquamail.com" },
    { name: "Horsey Horse", email: "neighy.horsey@stablemail.com" },
    { name: "Cowy Cow", email: "mooey.cowy@pasturenet.com" },
    { name: "Doggy Dog", email: "barky.doggy@kennemail.com" },
    { name: "Kitty Cat", email: "purry.kitty@whiskermail.com" },
    { name: "Mousey Mouse", email: "squeaky.mousey@cheesemail.com" },
    { name: "Froggy Frog", email: "hoppy.froggy@pondmail.com" },
    { name: "Turtle Turty", email: "shelly.turty@slowmail.com" },
    { name: "Snakey Snake", email: "hissy.snakey@scalemail.com" },
    { name: "Birdy Bird", email: "tweety.birdy@nestmail.com" },
    { name: "Hammy Hamster", email: "wheely.hammy@cagemail.com" },
    { name: "Goldy Goldfish", email: "bubbly.goldy@bowlmail.com" },
    { name: "Piggy Guinea", email: "squeaky.piggy@hutmail.com" },
    { name: "Iggy Iguana", email: "scaly.iggy@tropicmail.com" },
    { name: "Parry Parrot", email: "talky.parry@tropicmail.com" },
    { name: "Chamy Chameleon", email: "changy.chamy@rainforestmail.com" },
    { name: "Batty Bat", email: "flappy.batty@cavemail.com" },
    { name: "Octopussy Octopus", email: "inky.octopussy@deepseamail.com" },
    { name: "Sharky Shark", email: "toothy.sharky@oceanmail.com" },
    { name: "Wolfy Wolf", email: "howly.wolfy@moonmail.com" },
    { name: "Panda Pandy", email: "bamboo.pandy@asiamail.com" },
    { name: "Raccoony Raccoon", email: "masked.raccoony@trashmail.com" },
    { name: "Skunky Skunk", email: "smelly.skunky@forestmail.com" },
    { name: "Squirrely Squirrel", email: "nutty.squirrely@treemail.com" },
    { name: "Deery Deer", email: "prancy.deery@woodlandmail.com" },
    { name: "Goaty Goat", email: "climby.goaty@mountainmail.com" },
    { name: "Lamby Lamb", email: "fluffy.lamby@meadowmail.com" },
    { name: "Pondy Pony", email: "gallopy.pondy@stablemail.com" },
];

export async function createTestUsers() {
    for (const user of funAnimalUsers) {
        try {
            // Check if user already exists
            const existingUser = await Drizzle.getUserByEmail(user.email);
            if (existingUser) {
                continue;
            }

            // Add user to database
            await Drizzle.addUser(user.email, false); // Assuming no newsletter subscription

            // Get the created user
            const createdUser = await Drizzle.getUserByEmail(user.email);

            // Add username
            await Drizzle.addUsername(createdUser.userId, user.name);

            // Hash the password (using email as password)
            const salt = await bcrypt.genSalt(10);
            const password = await bcrypt.hash(user.email, salt);

            // Add password
            await Drizzle.addPassword(createdUser.userId, password);

            // Activate the user
            await Drizzle.updateUserActiveStatus(createdUser.userId);
        } catch (error) {}
    }
}
