export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          entity: string | null
          entity_id: string | null
          id: string
          meta: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          meta?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          meta?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      addresses: {
        Row: {
          city: string
          created_at: string
          id: string
          is_default: boolean
          label: string
          phone: string
          postal_code: string
          province: string
          recipient: string
          street: string
          updated_at: string
          user_id: string
        }
        Insert: {
          city: string
          created_at?: string
          id?: string
          is_default?: boolean
          label: string
          phone: string
          postal_code: string
          province: string
          recipient: string
          street: string
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string
          phone?: string
          postal_code?: string
          province?: string
          recipient?: string
          street?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      blogs: {
        Row: {
          author_id: string | null
          category_id: string | null
          content: string | null
          created_at: string
          excerpt: string | null
          id: string
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: Database["public"]["Enums"]["blog_status"]
          thumbnail: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: Database["public"]["Enums"]["blog_status"]
          thumbnail?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["blog_status"]
          thumbnail?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blogs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      cart: {
        Row: {
          created_at: string
          id: string
          note: string | null
          updated_at: string
          user_id: string
          voucher_code: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          updated_at?: string
          user_id: string
          voucher_code?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          updated_at?: string
          user_id?: string
          voucher_code?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          cart_id: string
          created_at: string
          custom_config: Json | null
          grind: Database["public"]["Enums"]["grind_size"] | null
          id: string
          name_snapshot: string
          product_id: string | null
          qty: number
          unit_price: number
          weight_g: number | null
        }
        Insert: {
          cart_id: string
          created_at?: string
          custom_config?: Json | null
          grind?: Database["public"]["Enums"]["grind_size"] | null
          id?: string
          name_snapshot: string
          product_id?: string | null
          qty: number
          unit_price: number
          weight_g?: number | null
        }
        Update: {
          cart_id?: string
          created_at?: string
          custom_config?: Json | null
          grind?: Database["public"]["Enums"]["grind_size"] | null
          id?: string
          name_snapshot?: string
          product_id?: string | null
          qty?: number
          unit_price?: number
          weight_g?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "cart"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      coupon_redemptions: {
        Row: {
          amount: number
          coupon_id: string
          created_at: string
          id: string
          order_id: string
          user_id: string
        }
        Insert: {
          amount: number
          coupon_id: string
          created_at?: string
          id?: string
          order_id: string
          user_id: string
        }
        Update: {
          amount?: number
          coupon_id?: string
          created_at?: string
          id?: string
          order_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_redemptions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          min_subtotal: number
          starts_at: string | null
          type: Database["public"]["Enums"]["coupon_type"]
          used_count: number
          value: number
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_subtotal?: number
          starts_at?: string | null
          type: Database["public"]["Enums"]["coupon_type"]
          used_count?: number
          value?: number
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_subtotal?: number
          starts_at?: string | null
          type?: Database["public"]["Enums"]["coupon_type"]
          used_count?: number
          value?: number
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          location: string | null
          slug: string
          starts_at: string
          thumbnail: string | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          location?: string | null
          slug: string
          starts_at: string
          thumbnail?: string | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          location?: string | null
          slug?: string
          starts_at?: string
          thumbnail?: string | null
          title?: string
        }
        Relationships: []
      }
      forum_posts: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          thread_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          thread_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_threads: {
        Row: {
          author_id: string
          body: string | null
          category: string | null
          created_at: string
          id: string
          is_locked: boolean
          is_pinned: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_locked?: boolean
          is_pinned?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_locked?: boolean
          is_pinned?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      loyalty_points: {
        Row: {
          balance: number
          lifetime: number
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          lifetime?: number
          tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          lifetime?: number
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      loyalty_transactions: {
        Row: {
          created_at: string
          delta: number
          id: string
          order_id: string | null
          reason: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delta: number
          id?: string
          order_id?: string | null
          reason: string
          user_id: string
        }
        Update: {
          created_at?: string
          delta?: number
          id?: string
          order_id?: string | null
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          title: string
          type: Database["public"]["Enums"]["notif_type"]
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title: string
          type: Database["public"]["Enums"]["notif_type"]
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notif_type"]
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          custom_config: Json | null
          grind: Database["public"]["Enums"]["grind_size"] | null
          id: string
          name_snapshot: string
          order_id: string
          product_id: string | null
          qty: number
          subtotal: number
          thumbnail: string | null
          unit_price: number
          weight_g: number | null
        }
        Insert: {
          custom_config?: Json | null
          grind?: Database["public"]["Enums"]["grind_size"] | null
          id?: string
          name_snapshot: string
          order_id: string
          product_id?: string | null
          qty: number
          subtotal: number
          thumbnail?: string | null
          unit_price: number
          weight_g?: number | null
        }
        Update: {
          custom_config?: Json | null
          grind?: Database["public"]["Enums"]["grind_size"] | null
          id?: string
          name_snapshot?: string
          order_id?: string
          product_id?: string | null
          qty?: number
          subtotal?: number
          thumbnail?: string | null
          unit_price?: number
          weight_g?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          bank: Database["public"]["Enums"]["bank"]
          cancel_reason: string | null
          completed_at: string | null
          courier: Database["public"]["Enums"]["courier"]
          created_at: string
          discount: number
          id: string
          note: string | null
          order_number: string
          paid_at: string | null
          recipient_city: string
          recipient_name: string
          recipient_phone: string
          recipient_postal_code: string
          recipient_province: string
          recipient_street: string
          shipped_at: string | null
          shipping_cost: number
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          tracking_number: string | null
          updated_at: string
          user_id: string
          voucher_code: string | null
        }
        Insert: {
          bank: Database["public"]["Enums"]["bank"]
          cancel_reason?: string | null
          completed_at?: string | null
          courier: Database["public"]["Enums"]["courier"]
          created_at?: string
          discount?: number
          id?: string
          note?: string | null
          order_number: string
          paid_at?: string | null
          recipient_city: string
          recipient_name: string
          recipient_phone: string
          recipient_postal_code: string
          recipient_province: string
          recipient_street: string
          shipped_at?: string | null
          shipping_cost?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          tracking_number?: string | null
          updated_at?: string
          user_id: string
          voucher_code?: string | null
        }
        Update: {
          bank?: Database["public"]["Enums"]["bank"]
          cancel_reason?: string | null
          completed_at?: string | null
          courier?: Database["public"]["Enums"]["courier"]
          created_at?: string
          discount?: number
          id?: string
          note?: string | null
          order_number?: string
          paid_at?: string | null
          recipient_city?: string
          recipient_name?: string
          recipient_phone?: string
          recipient_postal_code?: string
          recipient_province?: string
          recipient_street?: string
          shipped_at?: string | null
          shipping_cost?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string
          voucher_code?: string | null
        }
        Relationships: []
      }
      origins: {
        Row: {
          altitude: string | null
          created_at: string
          description: string | null
          hero_image: string | null
          id: string
          name: string
          region: string
          slug: string
          sort_order: number
        }
        Insert: {
          altitude?: string | null
          created_at?: string
          description?: string | null
          hero_image?: string | null
          id?: string
          name: string
          region: string
          slug: string
          sort_order?: number
        }
        Update: {
          altitude?: string | null
          created_at?: string
          description?: string | null
          hero_image?: string | null
          id?: string
          name?: string
          region?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          bank: Database["public"]["Enums"]["bank"]
          created_at: string
          id: string
          note: string | null
          order_id: string
          proof_url: string | null
          reject_reason: string | null
          sender_name: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount: number
          bank: Database["public"]["Enums"]["bank"]
          created_at?: string
          id?: string
          note?: string | null
          order_id: string
          proof_url?: string | null
          reject_reason?: string | null
          sender_name?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          bank?: Database["public"]["Enums"]["bank"]
          created_at?: string
          id?: string
          note?: string | null
          order_id?: string
          proof_url?: string | null
          reject_reason?: string | null
          sender_name?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt: string | null
          id: string
          product_id: string
          sort_order: number
          url: string
        }
        Insert: {
          alt?: string | null
          id?: string
          product_id: string
          sort_order?: number
          url: string
        }
        Update: {
          alt?: string | null
          id?: string
          product_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          acidity: number | null
          aroma: number | null
          body: number | null
          category_id: string | null
          compare_price: number | null
          created_at: string
          description: string | null
          id: string
          is_featured: boolean
          is_published: boolean
          kind: Database["public"]["Enums"]["product_kind"]
          name: string
          origin_id: string | null
          price: number
          process: Database["public"]["Enums"]["process_method"] | null
          roast_level: Database["public"]["Enums"]["roast_level"] | null
          slug: string
          sold_count: number
          stock: number
          tasting_notes: string[] | null
          thumbnail: string | null
          updated_at: string
          view_count: number
          weight_g: number | null
        }
        Insert: {
          acidity?: number | null
          aroma?: number | null
          body?: number | null
          category_id?: string | null
          compare_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          kind?: Database["public"]["Enums"]["product_kind"]
          name: string
          origin_id?: string | null
          price: number
          process?: Database["public"]["Enums"]["process_method"] | null
          roast_level?: Database["public"]["Enums"]["roast_level"] | null
          slug: string
          sold_count?: number
          stock?: number
          tasting_notes?: string[] | null
          thumbnail?: string | null
          updated_at?: string
          view_count?: number
          weight_g?: number | null
        }
        Update: {
          acidity?: number | null
          aroma?: number | null
          body?: number | null
          category_id?: string | null
          compare_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          kind?: Database["public"]["Enums"]["product_kind"]
          name?: string
          origin_id?: string | null
          price?: number
          process?: Database["public"]["Enums"]["process_method"] | null
          roast_level?: Database["public"]["Enums"]["roast_level"] | null
          slug?: string
          sold_count?: number
          stock?: number
          tasting_notes?: string[] | null
          thumbnail?: string | null
          updated_at?: string
          view_count?: number
          weight_g?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_origin_id_fkey"
            columns: ["origin_id"]
            isOneToOne: false
            referencedRelation: "origins"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      recipes: {
        Row: {
          author_id: string | null
          body: string | null
          created_at: string
          id: string
          method: Database["public"]["Enums"]["grind_size"] | null
          slug: string
          thumbnail: string | null
          title: string
        }
        Insert: {
          author_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          method?: Database["public"]["Enums"]["grind_size"] | null
          slug: string
          thumbnail?: string | null
          title: string
        }
        Update: {
          author_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          method?: Database["public"]["Enums"]["grind_size"] | null
          slug?: string
          thumbnail?: string | null
          title?: string
        }
        Relationships: []
      }
      review_photos: {
        Row: {
          id: string
          review_id: string
          url: string
        }
        Insert: {
          id?: string
          review_id: string
          url: string
        }
        Update: {
          id?: string
          review_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_photos_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          body: string | null
          created_at: string
          id: string
          order_id: string
          product_id: string
          rating: number
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          rating: number
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          courier: Database["public"]["Enums"]["courier"]
          delivered_at: string | null
          estimated_arrival: string | null
          id: string
          order_id: string
          shipped_at: string | null
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          courier: Database["public"]["Enums"]["courier"]
          delivered_at?: string | null
          estimated_arrival?: string | null
          id?: string
          order_id: string
          shipped_at?: string | null
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          courier?: Database["public"]["Enums"]["courier"]
          delivered_at?: string | null
          estimated_arrival?: string | null
          id?: string
          order_id?: string
          shipped_at?: string | null
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_deliveries: {
        Row: {
          created_at: string
          id: string
          order_id: string | null
          ship_date: string
          status: string
          subscription_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id?: string | null
          ship_date: string
          status?: string
          subscription_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string | null
          ship_date?: string
          status?: string
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_deliveries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_deliveries_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          address_id: string | null
          cadence_weeks: number
          created_at: string
          id: string
          next_ship_at: string | null
          preferences: Json | null
          status: Database["public"]["Enums"]["subscription_status"]
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          address_id?: string | null
          cadence_weeks?: number
          created_at?: string
          id?: string
          next_ship_at?: string | null
          preferences?: Json | null
          status?: Database["public"]["Enums"]["subscription_status"]
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          address_id?: string | null
          cadence_weeks?: number
          created_at?: string
          id?: string
          next_ship_at?: string | null
          preferences?: Json | null
          status?: Database["public"]["Enums"]["subscription_status"]
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_my_order: {
        Args: { p_order_id: string; p_reason?: string }
        Returns: {
          bank: Database["public"]["Enums"]["bank"]
          cancel_reason: string | null
          completed_at: string | null
          courier: Database["public"]["Enums"]["courier"]
          created_at: string
          discount: number
          id: string
          note: string | null
          order_number: string
          paid_at: string | null
          recipient_city: string
          recipient_name: string
          recipient_phone: string
          recipient_postal_code: string
          recipient_province: string
          recipient_street: string
          shipped_at: string | null
          shipping_cost: number
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          tracking_number: string | null
          updated_at: string
          user_id: string
          voucher_code: string | null
        }
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      mark_order_received: {
        Args: { p_order_id: string }
        Returns: {
          bank: Database["public"]["Enums"]["bank"]
          cancel_reason: string | null
          completed_at: string | null
          courier: Database["public"]["Enums"]["courier"]
          created_at: string
          discount: number
          id: string
          note: string | null
          order_number: string
          paid_at: string | null
          recipient_city: string
          recipient_name: string
          recipient_phone: string
          recipient_postal_code: string
          recipient_province: string
          recipient_street: string
          shipped_at: string | null
          shipping_cost: number
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          tracking_number: string | null
          updated_at: string
          user_id: string
          voucher_code: string | null
        }
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role: "customer" | "admin"
      bank: "bca" | "mandiri" | "bni" | "bri"
      blog_status: "draft" | "published"
      coupon_type: "percent" | "amount" | "free_shipping"
      courier: "jne" | "jnt" | "sicepat" | "anteraja"
      grind_size:
        | "whole_bean"
        | "espresso"
        | "v60"
        | "kalita"
        | "moka_pot"
        | "french_press"
        | "tubruk"
      notif_type: "order" | "payment" | "shipping" | "promo" | "system"
      order_status:
        | "menunggu_pembayaran"
        | "menunggu_verifikasi"
        | "diproses"
        | "dikirim"
        | "selesai"
        | "dibatalkan"
        | "refund"
      payment_status: "menunggu" | "diverifikasi" | "ditolak" | "refund"
      process_method:
        | "washed"
        | "natural"
        | "honey"
        | "wet_hulled"
        | "anaerobic"
      product_kind: "single_origin" | "blend" | "accessory" | "custom"
      roast_level: "light" | "medium" | "medium_dark" | "dark"
      subscription_status: "active" | "paused" | "cancelled"
      subscription_tier: "explorer" | "nusantara" | "premium"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["customer", "admin"],
      bank: ["bca", "mandiri", "bni", "bri"],
      blog_status: ["draft", "published"],
      coupon_type: ["percent", "amount", "free_shipping"],
      courier: ["jne", "jnt", "sicepat", "anteraja"],
      grind_size: [
        "whole_bean",
        "espresso",
        "v60",
        "kalita",
        "moka_pot",
        "french_press",
        "tubruk",
      ],
      notif_type: ["order", "payment", "shipping", "promo", "system"],
      order_status: [
        "menunggu_pembayaran",
        "menunggu_verifikasi",
        "diproses",
        "dikirim",
        "selesai",
        "dibatalkan",
        "refund",
      ],
      payment_status: ["menunggu", "diverifikasi", "ditolak", "refund"],
      process_method: ["washed", "natural", "honey", "wet_hulled", "anaerobic"],
      product_kind: ["single_origin", "blend", "accessory", "custom"],
      roast_level: ["light", "medium", "medium_dark", "dark"],
      subscription_status: ["active", "paused", "cancelled"],
      subscription_tier: ["explorer", "nusantara", "premium"],
    },
  },
} as const
