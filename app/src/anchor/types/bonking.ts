export type Bonking = {
  "version": "0.1.0",
  "name": "bonking",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "bonking",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "ticket coin"
          ]
        },
        {
          "name": "prizeMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "hash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "bonkTimeout",
          "type": "i64"
        },
        {
          "name": "slug",
          "type": "string"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "mint",
          "type": "publicKey"
        },
        {
          "name": "announcementTimeout",
          "type": "i64"
        }
      ]
    },
    {
      "name": "bonk",
      "accounts": [
        {
          "name": "bonk",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonking",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "payedBonk",
      "accounts": [
        {
          "name": "bonk",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fromAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "toAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonking",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "finalize",
      "accounts": [
        {
          "name": "bonking",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "hash1Source",
          "type": "string"
        }
      ]
    },
    {
      "name": "finalizeByTimeout",
      "accounts": [
        {
          "name": "bonking",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "withdrawInitializingTokenAccount",
      "accounts": [
        {
          "name": "bonking",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "winnerBonk",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "to",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "withdraw",
      "accounts": [
        {
          "name": "bonking",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "winnerBonk",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "to",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "closeBonking",
      "accounts": [
        {
          "name": "bonking",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "will be closed"
          ]
        },
        {
          "name": "escrowWallet",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "will be closed"
          ]
        },
        {
          "name": "to",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "closeBonk",
      "accounts": [
        {
          "name": "bonk",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "will be closed"
          ]
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "bonk",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "num",
            "type": "u32"
          },
          {
            "name": "announcementTimeout",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "bonking",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "count",
            "type": "u32"
          },
          {
            "name": "winner",
            "type": "u32"
          },
          {
            "name": "hash1",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "hash2",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "timeout",
            "type": "i64"
          },
          {
            "name": "status",
            "type": "u8"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "announcementTimeout",
            "type": "i64"
          }
        ]
      }
    }
  ]
};

export const IDL: Bonking = {
  "version": "0.1.0",
  "name": "bonking",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "bonking",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "ticket coin"
          ]
        },
        {
          "name": "prizeMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "hash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "bonkTimeout",
          "type": "i64"
        },
        {
          "name": "slug",
          "type": "string"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "mint",
          "type": "publicKey"
        },
        {
          "name": "announcementTimeout",
          "type": "i64"
        }
      ]
    },
    {
      "name": "bonk",
      "accounts": [
        {
          "name": "bonk",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonking",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "payedBonk",
      "accounts": [
        {
          "name": "bonk",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fromAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "toAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonking",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "finalize",
      "accounts": [
        {
          "name": "bonking",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "hash1Source",
          "type": "string"
        }
      ]
    },
    {
      "name": "finalizeByTimeout",
      "accounts": [
        {
          "name": "bonking",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "withdrawInitializingTokenAccount",
      "accounts": [
        {
          "name": "bonking",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "winnerBonk",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "to",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "withdraw",
      "accounts": [
        {
          "name": "bonking",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "winnerBonk",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "to",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "closeBonking",
      "accounts": [
        {
          "name": "bonking",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "will be closed"
          ]
        },
        {
          "name": "escrowWallet",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "will be closed"
          ]
        },
        {
          "name": "to",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "closeBonk",
      "accounts": [
        {
          "name": "bonk",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "will be closed"
          ]
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "bonk",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "num",
            "type": "u32"
          },
          {
            "name": "announcementTimeout",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "bonking",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "count",
            "type": "u32"
          },
          {
            "name": "winner",
            "type": "u32"
          },
          {
            "name": "hash1",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "hash2",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "timeout",
            "type": "i64"
          },
          {
            "name": "status",
            "type": "u8"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "announcementTimeout",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
