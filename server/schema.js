const RESPONSE_SCHEMA = {
    type: "json_schema",

    json_schema: {

        name: "atlantic_itinerary",

        strict: true,

        schema: {

            type: "object",

            additionalProperties: false,

            required: [

                "assistant_reply",

                "trip_title",

                "vibe_match",

                "vibe_profile",

                "ui_tags",

                "route_map",

                "destination_stays",

                "days"

            ],

            properties: {

                assistant_reply: {
                    type: "string"
                },

                trip_title: {
                    type: "string"
                },

                vibe_match: {
                    type: "string"
                },

                vibe_profile: {

                    type: "string",

                    enum: [

                        "Edge of the Earth",

                        "Coastal Artisan",

                        "Oceanic Phenomenon",

                        "Pastoral Retreat"

                    ]

                },

                ui_tags: {

                    type: "array",

                    items: {
                        type: "string"
                    }

                },

                route_map: {

                    type: "object",

                    additionalProperties: false,

                    required: [

                        "start",

                        "end",

                        "drive_time",

                        "crossings"

                    ],

                    properties: {

                        start: {
                            type: "string"
                        },

                        end: {
                            type: "string"
                        },

                        drive_time: {
                            type: "string"
                        },

                        crossings: {
                            type: "string"
                        }

                    }

                },

                destination_stays: {

                    type: "array",

                    items: {

                        type: "object",

                        additionalProperties: false,

                        required: [

                            "name",

                            "nights",

                            "style"

                        ],

                        properties: {

                            name: {
                                type: "string"
                            },

                            nights: {
                                type: "integer"
                            },

                            style: {
                                type: "string"
                            }

                        }

                    }

                },

                days: {

                    type: "array",

                    items: {

                        type: "object",

                        additionalProperties: false,

                        required: [

                            "day_number",

                            "theme",

                            "route",

                            "morning",

                            "afternoon",

                            "dining",

                            "guide_tour",

                            "swap_option"

                        ],

                        properties: {

                            day_number: {
                                type: "integer"
                            },

                            theme: {
                                type: "string"
                            },

                            route: {
                                type: "string"
                            },

                            morning: {
                                type: "string"
                            },

                            afternoon: {
                                type: "string"
                            },

                            dining: {
                                type: "string"
                            },

                            guide_tour: {
                                type: "string"
                            },

                            swap_option: {
                                type: "string"
                            }

                        }

                    }

                }

            }

        }

    }

};

export default RESPONSE_SCHEMA;